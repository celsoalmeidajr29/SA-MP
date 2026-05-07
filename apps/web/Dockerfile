FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/database/package*.json ./packages/database/
RUN npm install --workspace=apps/web --workspace=packages/database
COPY packages/database ./packages/database
COPY apps/web ./apps/web
RUN npm run build --workspace=packages/database
RUN npm run build --workspace=apps/web

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
EXPOSE 3000
WORKDIR /app/apps/web
CMD ["npm", "run", "start"]
