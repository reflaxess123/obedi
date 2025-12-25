import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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
      // Save previous recipe if exists
      if (currentRecipe) {
        currentRecipe.photos = currentPhotos;
        if (currentRecipe.title && currentRecipe.title !== 'Channel photo changed') {
          recipes.push(currentRecipe);
        }
      }

      // Parse new recipe
      const $text = cheerio.load(text);
      const title = $text('strong').first().text().trim().replace(/<br>/g, '').trim();

      // Clean up recipe text - remove HTML tags, convert br to newlines
      let recipeText = text
        .replace(/<strong>.*?<\/strong>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<a[^>]*>.*?<\/a>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .trim();

      currentRecipe = {
        title: title || 'Без названия',
        recipe: recipeText,
        photos: [],
      };
      currentPhotos = photoHref ? [photoHref] : [];
    } else if (photoHref && currentRecipe) {
      // Additional photo for current recipe
      currentPhotos.push(photoHref);
    }
  });

  // Don't forget last recipe
  if (currentRecipe) {
    currentRecipe.photos = currentPhotos;
    if (currentRecipe.title) {
      recipes.push(currentRecipe);
    }
  }

  return recipes;
}

async function main() {
  const exportDir = path.join(__dirname, '../../In/ChatExport_2025-12-25');
  const htmlPath = path.join(exportDir, 'messages.html');
  const photosDir = path.join(exportDir, 'photos');
  const publicDir = path.join(__dirname, '../public/uploads');

  // Ensure public dir exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Parsing HTML...');
  const recipes = parseHtml(htmlPath);
  console.log(`Found ${recipes.length} recipes`);

  // Get or create a user for recipes
  let user = await prisma.user.findFirst({ where: { email: 'demo@example.com' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuv', // placeholder
      },
    });
  }

  console.log(`Using user: ${user.email}`);

  // Clear existing lunches (optional)
  await prisma.lunchImage.deleteMany({});
  await prisma.lunch.deleteMany({});
  console.log('Cleared existing data');

  for (const recipe of recipes) {
    console.log(`\nImporting: ${recipe.title}`);

    // Copy photos
    const imageUrls: string[] = [];
    for (const photo of recipe.photos) {
      const srcPath = path.join(exportDir, photo);
      if (fs.existsSync(srcPath) && !photo.includes('_thumb')) {
        const filename = path.basename(photo);
        const destPath = path.join(publicDir, filename);
        fs.copyFileSync(srcPath, destPath);
        imageUrls.push(`http://localhost:3001/static/uploads/${filename}`);
        console.log(`  Copied: ${filename}`);
      }
    }

    // Create lunch
    const lunch = await prisma.lunch.create({
      data: {
        userId: user.id,
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
          key: `local-${lunch.id}-${i}`,
          position: i + 1,
        },
      });
    }

    console.log(`  Created lunch #${lunch.id} with ${imageUrls.length} images`);
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
