FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY . .

RUN yarn run db:generate

RUN yarn run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock prisma.config.ts ./

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

USER node

CMD ["node", "dist/src/main"]