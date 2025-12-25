import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

// Prod credentials
const DATABASE_URL = 'postgresql://postgres:t5w0hkaslhidtc5v@146.103.126.232:5432/postgres';
const SUPABASE_URL = 'https://lkzlaoffbljsvqvedryq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxremxhb2ZmYmxqc3ZxdmVkcnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY2MTg5OCwiZXhwIjoyMDgyMjM3ODk4fQ.M6BS6EiuHigTg3ec36hIwzJPbNcJW1U8j8PVXRDSydE';
const SUPABASE_BUCKET = 'lunches';

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface Recipe {
  title: string;
  recipe: string;
  photos: string[];
}

function parseHtml(htmlPath: string): Recipe[] {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  const recipes: Recipe[] = [];

  let currentRecipe: Recipe | null = null as Recipe | null;
  let currentPhotos: string[] = [];

  $('.message.default').each((_, el) => {
    const $el = $(el);
    const text = $el.find('.text').html();
    const photoHref = $el.find('.photo_wrap').attr('href');

    if (text) {
      if (currentRecipe !== null) {
        currentRecipe.photos = currentPhotos;
        if (currentRecipe.title && !currentRecipe.title.includes('Channel') && currentRecipe.title !== 'Без названия') {
          recipes.push(currentRecipe);
        }
      }

      const $text = cheerio.load(text);
      const title = $text('strong').first().text().trim().replace(/<br>/g, '').replace(/\n/g, '').trim();

      let recipeText = text
        .replace(/<strong>.*?<\/strong>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<a[^>]*>.*?<\/a>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .trim();

      // Skip navigation messages
      if (recipeText.includes('Завтраки:') && recipeText.includes('Обеды:')) {
        currentRecipe = null;
        currentPhotos = [];
        return;
      }

      currentRecipe = {
        title: title || 'Без названия',
        recipe: recipeText,
        photos: [],
      };
      currentPhotos = photoHref && !photoHref.includes('_thumb') ? [photoHref] : [];
    } else if (photoHref && currentRecipe && !photoHref.includes('_thumb')) {
      currentPhotos.push(photoHref);
    }
  });

  if (currentRecipe && currentRecipe.title && !currentRecipe.title.includes('Channel')) {
    currentRecipe.photos = currentPhotos;
    recipes.push(currentRecipe);
  }

  return recipes;
}

async function uploadToSupabase(filePath: string, fileName: string): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const uniqueName = `seed-${Date.now()}-${fileName}`;

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(uniqueName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error(`Upload error for ${fileName}:`, error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(uniqueName);

    return urlData.publicUrl;
  } catch (e) {
    console.error(`Failed to upload ${fileName}:`, e);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting production seed...\n');

  const exportDir = path.join(__dirname, '../../In/ChatExport_2025-12-25');
  const htmlPath = path.join(exportDir, 'messages.html');

  // Check if export exists
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ Telegram export not found at:', htmlPath);
    process.exit(1);
  }

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.orderHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lunchImage.deleteMany();
  await prisma.lunch.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('\n👥 Creating users...');

  const users = {
    vadim: await prisma.user.create({
      data: {
        email: 'vadim@example.com',
        name: 'Вадим',
        passwordHash: await bcrypt.hash('123123', 10),
        provider: 'EMAIL',
      },
    }),
    anastasia: await prisma.user.create({
      data: {
        email: 'anastasia@example.com',
        name: 'Анастасия',
        passwordHash: await bcrypt.hash('123123', 10),
        provider: 'EMAIL',
      },
    }),
    chef: await prisma.user.create({
      data: {
        email: 'chef@example.com',
        name: 'Шеф-повар Иван',
        passwordHash: await bcrypt.hash('password123', 10),
        provider: 'EMAIL',
      },
    }),
    anna: await prisma.user.create({
      data: {
        email: 'foodie@example.com',
        name: 'Гурман Анна',
        passwordHash: await bcrypt.hash('password123', 10),
        provider: 'EMAIL',
      },
    }),
  };

  console.log('  ✅ Вадим (vadim@example.com / 123123)');
  console.log('  ✅ Анастасия (anastasia@example.com / 123123)');
  console.log('  ✅ Шеф-повар Иван (chef@example.com / password123)');
  console.log('  ✅ Гурман Анна (foodie@example.com / password123)');

  // Parse and import recipes
  console.log('\n📖 Parsing Telegram export...');
  const recipes = parseHtml(htmlPath);
  console.log(`  Found ${recipes.length} recipes\n`);

  console.log('🍳 Importing recipes for Анастасия...\n');

  for (const recipe of recipes) {
    console.log(`  📝 ${recipe.title}`);

    // Upload photos to Supabase
    const imageUrls: string[] = [];
    for (const photo of recipe.photos) {
      const photoPath = path.join(exportDir, photo);
      if (fs.existsSync(photoPath)) {
        const fileName = path.basename(photo);
        console.log(`     📷 Uploading ${fileName}...`);
        const url = await uploadToSupabase(photoPath, fileName);
        if (url) {
          imageUrls.push(url);
          console.log(`     ✅ Uploaded`);
        }
      }
    }

    // Create lunch
    const lunch = await prisma.lunch.create({
      data: {
        userId: users.anastasia.id,
        title: recipe.title,
        recipe: recipe.recipe,
        difficulty: 'EASY',
        tags: ['семейные рецепты'],
      },
    });

    // Add images
    for (let i = 0; i < imageUrls.length; i++) {
      await prisma.lunchImage.create({
        data: {
          lunchId: lunch.id,
          url: imageUrls[i],
          key: `seed-${lunch.id}-${i}`,
          position: i,
        },
      });
    }

    console.log(`     ✅ Created with ${imageUrls.length} images\n`);
  }

  console.log('🎉 Seed completed!\n');
  console.log('Test accounts:');
  console.log('  • vadim@example.com / 123123');
  console.log('  • anastasia@example.com / 123123');
  console.log('  • chef@example.com / password123');
  console.log('  • foodie@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
