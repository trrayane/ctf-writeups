FROM node:22-alpine AS frontend-build

RUN corepack enable

WORKDIR /frontend

# Install frontend deps first for better layer caching.
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/tsconfig.json ./
COPY frontend/tsconfig.app.json ./
COPY frontend/tsconfig.node.json ./
COPY frontend/vite.config.ts ./
COPY frontend/index.html ./
COPY frontend/public ./public
COPY frontend/src ./src

RUN pnpm run build


FROM node:22-alpine AS backend-build

RUN corepack enable

# Required for ANTLR generation during the backend build.
RUN apk add --no-cache openjdk17

WORKDIR /app

# Install backend deps first for better layer caching.
COPY backend/package.json backend/package-lock.json ./
RUN pnpm import && pnpm install --frozen-lockfile

COPY backend/tsconfig.json ./tsconfig.json
COPY backend/src ./src
COPY backend/public ./public

# Merge the built frontend into the backend's public assets.
COPY --from=frontend-build /frontend/dist/. ./public/

RUN pnpm run build


FROM node:22-alpine AS runtime

RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production

COPY --from=backend-build /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/public ./public


RUN mkdir /flag

COPY flag.txt /flag/flag.txt


EXPOSE 8000

CMD ["pnpm", "run", "start"]
