# Stage 1: Install dependencies
FROM node:24-alpine3.23 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:24-alpine3.23 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:24-alpine3.23 AS runner
WORKDIR /app

ENV NODE_ENV production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# add non-root user for security (optional but best practice)
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy the public folder to be served by the built-in server
COPY --from=builder /app/public ./public

# Copy the standalone output folder and the static folder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
