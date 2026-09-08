FROM node:24-bookworm-slim AS builder
WORKDIR /app
RUN npm install --global pnpm@11.6.0

COPY . .
RUN pnpm install --frozen-lockfile

# Only the public site URL is needed while compiling browser assets.
ARG NEXT_PUBLIC_SITE_URL=""
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV PORT=3000 BASE_PATH=/
RUN pnpm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0

# The API build bundles its dependencies, including its logging workers.
COPY --from=builder --chown=node:node /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder --chown=node:node /app/artifacts/mark-andrei-portfolio/dist/public ./artifacts/mark-andrei-portfolio/dist/public

USER node
EXPOSE 3000
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
