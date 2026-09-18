# ---- Base ----
FROM node:24-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.3.0 --activate

# ---- Dependencies ----
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN pnpm build

# ---- Production ----
FROM base AS production

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist

RUN mkdir -p uploads

EXPOSE 4000

CMD ["node", "dist/server.js"]