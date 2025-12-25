import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const foodImages = [
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800',
  'https://images.unsplash.com/photo-1482049016gy-2d6c0a6c9f0b?w=800',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800',
  'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800',
];

const lunches = [
  {
    title: 'Борщ с пампушками',
    recipe: '# Борщ\n\nКлассический украинский борщ с чесночными пампушками.\n\n## Ингредиенты\n- Свёкла - 2 шт\n- Капуста - 300г\n- Картофель - 3 шт\n- Морковь - 1 шт\n- Лук - 1 шт\n- Говядина - 500г\n\n## Приготовление\n1. Сварить бульон из говядины\n2. Добавить картофель\n3. Обжарить лук и морковь\n4. Добавить свёклу и капусту\n5. Варить до готовности',
    calories: 280,
    proteins: 15,
    fats: 12,
    carbs: 28,
    cookingTime: 120,
    difficulty: 'MEDIUM' as const,
    tags: ['суп', 'украинская кухня', 'обед'],
  },
  {
    title: 'Паста Карбонара',
    recipe: '# Карбонара\n\nИтальянская классика с беконом и пармезаном.\n\n## Ингредиенты\n- Спагетти - 400г\n- Бекон - 200г\n- Яйца - 4 шт\n- Пармезан - 100г\n- Чеснок - 2 зубчика',
    calories: 520,
    proteins: 22,
    fats: 28,
    carbs: 45,
    cookingTime: 30,
    difficulty: 'EASY' as const,
    tags: ['паста', 'итальянская кухня', 'быстро'],
  },
  {
    title: 'Цезарь с курицей',
    recipe: '# Салат Цезарь\n\nХрустящий салат с сочной курицей и соусом.\n\n## Ингредиенты\n- Куриная грудка - 300г\n- Салат Романо - 1 кочан\n- Пармезан - 50г\n- Сухарики - 100г\n- Соус Цезарь - 100мл',
    calories: 380,
    proteins: 32,
    fats: 18,
    carbs: 22,
    cookingTime: 25,
    difficulty: 'EASY' as const,
    tags: ['салат', 'курица', 'здоровое питание'],
  },
  {
    title: 'Том Ям',
    recipe: '# Том Ям\n\nОстрый тайский суп с креветками.\n\n## Ингредиенты\n- Креветки - 300г\n- Грибы шиитаке - 150г\n- Паста том ям - 3 ст.л.\n- Кокосовое молоко - 400мл\n- Лайм - 2 шт',
    calories: 220,
    proteins: 18,
    fats: 14,
    carbs: 8,
    cookingTime: 35,
    difficulty: 'MEDIUM' as const,
    tags: ['суп', 'тайская кухня', 'острое', 'морепродукты'],
  },
  {
    title: 'Стейк Рибай',
    recipe: '# Стейк Рибай\n\nИдеально прожаренный стейк medium rare.\n\n## Ингредиенты\n- Рибай - 400г\n- Сливочное масло - 50г\n- Чеснок - 3 зубчика\n- Розмарин - 2 веточки\n- Тимьян - 2 веточки',
    calories: 650,
    proteins: 45,
    fats: 52,
    carbs: 0,
    cookingTime: 20,
    difficulty: 'HARD' as const,
    tags: ['мясо', 'стейк', 'гриль'],
  },
  {
    title: 'Греческий салат',
    recipe: '# Греческий салат\n\nСвежий и лёгкий средиземноморский салат.\n\n## Ингредиенты\n- Огурцы - 2 шт\n- Помидоры - 3 шт\n- Фета - 200г\n- Маслины - 100г\n- Красный лук - 1 шт\n- Оливковое масло - 3 ст.л.',
    calories: 280,
    proteins: 12,
    fats: 22,
    carbs: 10,
    cookingTime: 15,
    difficulty: 'EASY' as const,
    tags: ['салат', 'греческая кухня', 'вегетарианское'],
  },
  {
    title: 'Рамен с чашу',
    recipe: '# Рамен\n\nЯпонский рамен со свиной грудинкой и яйцом.\n\n## Ингредиенты\n- Лапша рамен - 200г\n- Свиная грудинка - 300г\n- Яйцо - 2 шт\n- Бульон тонкоцу - 1л\n- Зелёный лук - пучок',
    calories: 580,
    proteins: 35,
    fats: 28,
    carbs: 48,
    cookingTime: 180,
    difficulty: 'HARD' as const,
    tags: ['суп', 'японская кухня', 'лапша'],
  },
  {
    title: 'Хачапури по-аджарски',
    recipe: '# Хачапури\n\nГрузинская лодочка с сыром и яйцом.\n\n## Ингредиенты\n- Тесто дрожжевое - 500г\n- Сулугуни - 300г\n- Имеретинский сыр - 200г\n- Яйцо - 2 шт\n- Сливочное масло - 50г',
    calories: 480,
    proteins: 22,
    fats: 28,
    carbs: 38,
    cookingTime: 45,
    difficulty: 'MEDIUM' as const,
    tags: ['выпечка', 'грузинская кухня', 'сыр'],
  },
  {
    title: 'Фо Бо',
    recipe: '# Фо Бо\n\nВьетнамский суп с говядиной и рисовой лапшой.\n\n## Ингредиенты\n- Говяжий бульон - 1.5л\n- Рисовая лапша - 200г\n- Говядина - 300г\n- Лук - 1 шт\n- Имбирь - 50г\n- Специи фо',
    calories: 320,
    proteins: 28,
    fats: 8,
    carbs: 35,
    cookingTime: 60,
    difficulty: 'MEDIUM' as const,
    tags: ['суп', 'вьетнамская кухня', 'лапша'],
  },
  {
    title: 'Тирамису',
    recipe: '# Тирамису\n\nИтальянский десерт с маскарпоне и кофе.\n\n## Ингредиенты\n- Маскарпоне - 500г\n- Печенье Савоярди - 300г\n- Эспрессо - 300мл\n- Яйца - 4 шт\n- Какао - 30г',
    calories: 420,
    proteins: 8,
    fats: 28,
    carbs: 35,
    cookingTime: 40,
    difficulty: 'MEDIUM' as const,
    tags: ['десерт', 'итальянская кухня', 'кофе'],
  },
];

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.orderHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lunchImage.deleteMany();
  await prisma.lunch.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Демо Пользователь',
      passwordHash,
      provider: 'EMAIL',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'chef@example.com',
      name: 'Шеф-повар Иван',
      passwordHash,
      provider: 'EMAIL',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'foodie@example.com',
      name: 'Гурман Анна',
      passwordHash,
      provider: 'EMAIL',
    },
  });

  console.log('Created users:', user1.email, user2.email, user3.email);

  // Create lunches for users
  const users = [user1, user2, user3];

  for (let i = 0; i < lunches.length; i++) {
    const lunchData = lunches[i];
    const user = users[i % users.length];
    const imageUrl = foodImages[i % foodImages.length];

    const lunch = await prisma.lunch.create({
      data: {
        ...lunchData,
        userId: user.id,
        images: {
          create: {
            url: imageUrl,
            key: `seed-image-${i}`,
            width: 800,
            height: 600,
            position: 0,
          },
        },
      },
      include: { images: true },
    });

    console.log(`Created lunch: ${lunch.title} (${lunch.images.length} images)`);
  }

  console.log('Seeding completed!');
  console.log('\nTest accounts:');
  console.log('  demo@example.com / password123');
  console.log('  chef@example.com / password123');
  console.log('  foodie@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
