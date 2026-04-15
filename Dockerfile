# --- Stage 1: Build Stage ---
FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy the files needed for installing dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
# --frozen-lockfile to avoid lockfile being edited in the container
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# --- Stage 2: Production Stage ---
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production

# Install pnpm in the production stage
RUN npm install -g pnpm

# Copy package files
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy compiled code from builder
COPY --from=builder --chown=node:node /app/dist ./dist

# Create production user other than root
USER node
EXPOSE 3000

CMD ["node", "dist/server.js"]