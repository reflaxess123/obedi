# Deployment Guide for Dokploy

## IP Address
- Server: `147.45.108.38`
- No HTTPS (HTTP only)

## Files Structure

```
obedi/
├── back/
│   ├── Dockerfile           # Backend Docker build
│   ├── .env.production      # Backend env (COPY YOUR KEYS!)
│   └── prisma/
├── front/
│   ├── Dockerfile           # Frontend Docker build
│   ├── nginx.conf           # Nginx config for frontend container
│   └── .env.production      # Frontend env
├── docker-compose.prod.yml  # Full stack compose
├── nginx.conf               # Standalone nginx (if needed)
└── .dockerignore
```

## Configuration

### 1. Backend `.env.production`

Copy and fill in your actual values:

```env
DATABASE_URL="postgresql://obedi:YOUR_PASSWORD@postgres:5432/obedi_production"
JWT_SECRET="YOUR_SECURE_RANDOM_STRING_32_CHARS_MIN"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
SUPABASE_URL="https://lkzlaoffbljsvqvedryq.supabase.co"
SUPABASE_SERVICE_KEY="YOUR_SUPABASE_SERVICE_KEY_FROM_DEV_ENV"
SUPABASE_BUCKET="lunches"
PORT=3001
FRONTEND_URL="http://147.45.108.38"
```

### 2. Frontend `.env.production`

Usually empty since API is proxied through nginx.

## Dokploy Deployment

### Option A: Docker Compose (Recommended)

1. Create a new "Compose" project in Dokploy
2. Point to the repository
3. Set compose file path: `docker-compose.prod.yml`
4. Set environment variable: `POSTGRES_PASSWORD=your_secure_password`
5. Deploy

### Option B: Separate Services

#### Backend Service:
- **Dockerfile path**: `back/Dockerfile`
- **Build context**: `.` (root)
- **Port**: 3001
- **Env vars**: Copy from `back/.env.production`

#### Frontend Service:
- **Dockerfile path**: `front/Dockerfile`
- **Build context**: `.` (root)
- **Port**: 80

### Option C: Manual Docker Build

```bash
# From project root
cd /path/to/obedi

# Build backend
docker build -f back/Dockerfile -t obedi-backend .

# Build frontend
docker build -f front/Dockerfile -t obedi-frontend .

# Run with compose
docker-compose -f docker-compose.prod.yml up -d
```

## Database Migration

After first deploy, run migrations:

```bash
# Connect to backend container
docker exec -it obedi-backend sh

# Run migrations
npx prisma migrate deploy

# (Optional) Seed data
npx prisma db seed
```

## Verify Deployment

- Frontend: http://147.45.108.38
- API: http://147.45.108.38/api/v1
- Swagger: http://147.45.108.38/api/docs

## CORS

Backend is configured to accept requests from:
- `http://147.45.108.38`

To add more origins, update `FRONTEND_URL` with comma-separated values:
```env
FRONTEND_URL="http://147.45.108.38,http://yourdomain.com"
```
