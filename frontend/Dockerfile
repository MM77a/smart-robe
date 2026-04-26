FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["npm", "start"]
