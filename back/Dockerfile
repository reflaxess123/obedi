# Build from root of monorepo: docker build -f back/Dockerfile .
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY back/package.json ./back/
COPY back/prisma ./back/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source
COPY back ./back

# Generate Prisma client
WORKDIR /app/back
RUN npx prisma generate

# Build
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY back/package.json ./back/
COPY back/prisma ./back/prisma/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma client
WORKDIR /app/back
RUN npx prisma generate

# Copy built files
COPY --from=builder /app/back/dist ./dist

# Create public folder
RUN mkdir -p public

EXPOSE 3001

CMD ["node", "dist/main"]
