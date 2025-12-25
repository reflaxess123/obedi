# Obedi - Lunch Management App

Приложение для управления обедами.

## Quick Start

```bash
pnpm install
pnpm dev
```

- Frontend: http://localhost:3002
- Backend: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

## Test Accounts

| Email | Password | Описание |
|-------|----------|----------|
| vadim@example.com | 123123 | Вадим |
| anastasia@example.com | 123123 | Анастасия (семейные рецепты) |
| chef@example.com | password123 | Шеф-повар Иван |
| foodie@example.com | password123 | Гурман Анна |

## Stack

- **Frontend**: Vue 3 + TypeScript + Vite + Tailwind + FSD
- **Backend**: NestJS + Prisma + PostgreSQL
- **Storage**: Supabase S3

## Database

```bash
# Start PostgreSQL
pnpm docker:up

# Run migrations
cd back && npx prisma migrate dev

# Seed data
cd back && npx prisma db seed
```
