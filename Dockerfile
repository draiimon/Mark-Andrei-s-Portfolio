FROM node:24-slim AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY artifacts/api-server/package.json artifacts/api-server/package.json
COPY artifacts/mark-andrei-portfolio/package.json artifacts/mark-andrei-portfolio/package.json
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/package.json
COPY lib/api-client-react/package.json lib/api-client-react/package.json
COPY lib/api-spec/package.json lib/api-spec/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
COPY lib/db/package.json lib/db/package.json
COPY scripts/package.json scripts/package.json

RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV PORT=5000
ENV BASE_PATH=/

RUN pnpm --filter @workspace/mark-andrei-portfolio run build
RUN pnpm --filter @workspace/api-server run build

FROM node:24-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0
ENV STATIC_ROOT=/app/artifacts/mark-andrei-portfolio/dist/public
ARG GIT_COMMIT=unknown
ENV APP_COMMIT_SHA=$GIT_COMMIT

RUN echo "Building portfolio commit ${GIT_COMMIT}"

COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/artifacts/mark-andrei-portfolio/dist/public ./artifacts/mark-andrei-portfolio/dist/public

EXPOSE 5000

CMD ["node", "--enable-source-maps", "/app/artifacts/api-server/dist/index.mjs"]