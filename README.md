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

| Email | Password |
|-------|----------|
| demo@example.com | password123 |
| chef@example.com | password123 |
| foodie@example.com | password123 |

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
