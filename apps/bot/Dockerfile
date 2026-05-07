FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/bot/package*.json ./apps/bot/
COPY packages/database/package*.json ./packages/database/
RUN npm install --workspace=apps/bot --workspace=packages/database
COPY packages/database ./packages/database
COPY apps/bot ./apps/bot
RUN npm run build --workspace=packages/database
RUN npm run build --workspace=apps/bot

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/bot/dist ./dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
