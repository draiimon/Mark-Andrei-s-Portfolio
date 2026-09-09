# Mark Andrei's Portfolio

The current app uses React/Vite and an Express API. The production server serves
both on one port, including `/api` routes and direct links to `/home` and `/edit`.
Node.js 24 and pnpm 11.6.0 are used by the Docker build.

## Local Docker

Install and start Docker Desktop with Linux containers. Keep your existing `.env`
in the repository root, then run:

```sh
docker compose up --build -d
```

Open http://localhost:3000. Use `docker compose logs -f portfolio` for logs and
`docker compose down` to stop. Compose injects `.env` at runtime; secret files
are excluded from the image. Only `NEXT_PUBLIC_SITE_URL` is a build argument.

## Local Node.js

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development launcher loads the root `.env`, builds the API, and starts Vite
on port 3000 with API proxying to port 3001. Restart it after API changes.
Override `PORT` and `API_PORT` if those ports are occupied.

To run the production app, set `PORT=3000` and `BASE_PATH=/` in your shell, run
`pnpm build`, then `pnpm start`. The start command loads `.env` automatically.

## Render

Create or configure a Web Service using the Docker runtime, branch `new-preview`,
repository root as the build context, and `./Dockerfile`. Leave the Docker
Command unset so the image's CMD runs. Set the health check to `/api/healthz`.

Copy the values of `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and
`GROQ_API_KEY` from your `.env` into Render's environment settings. Set
`NEXT_PUBLIC_SITE_URL` to the public HTTPS URL before building the image. Render
supplies `PORT`; the API listens on `0.0.0.0`. No schema changes are run at startup.

Reference: https://render.com/docs/docker
