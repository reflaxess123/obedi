# Build from root of monorepo: docker build -f front/Dockerfile .
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY front/package.json ./front/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY front ./front

# Build
WORKDIR /app/front
RUN pnpm build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/front/dist /usr/share/nginx/html

# Copy nginx config
COPY front/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
