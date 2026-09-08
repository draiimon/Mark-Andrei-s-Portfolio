## Mark Andrei's Portfolio

Minimalist cloud-devops themed portfolio for **Mark Andrei R. Castillo**, built with:

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + Framer Motion
- Prisma + PostgreSQL (Neon)
- Groq-powered chatbot about Andrei

### Local development

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in a `.env` file (copy from `.env.example`):

```bash
DATABASE_URL="<your Neon Postgres connection string>"
GROQ_API_KEY="<your Groq API key>"
ADMIN_USERNAME="<admin login username>"
ADMIN_PASSWORD="<admin login password>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXTAUTH_SECRET="<random-long-secret>"
NEXTAUTH_URL="http://localhost:3000"
```

For Neon + Prisma, use a pooled connection string with SSL:

```bash
DATABASE_URL="postgresql://<user>:<password>@<project>-pooler.<region>.aws.neon.tech/<db>?sslmode=require&pgbouncer=true&connect_timeout=15"
```

3. Apply Prisma migrations:

```bash
npx prisma migrate dev --name init
```

4. Run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

5. Verify environment + DB connectivity:

```bash
npm run env:check
```

### Production deployment notes

- Run `npm run db:deploy` during deploy before `next start`.
- Confirm `DATABASE_URL` is set in the hosting platform environment (not only local `.env`).
- If the database is temporarily unreachable, the homepage now falls back safely instead of crashing.

### Snapshot backup (git-safe fallback)

- Current portfolio state is committed at `src/data/portfolio-snapshot.json`.
- Homepage auto-falls back to this snapshot if DB content is missing/unavailable.
- Export latest DB state into snapshot:

```bash
npm run db:snapshot:export
```

- Restore snapshot into current DB:

```bash
npm run db:snapshot:restore
```

### Admin panel

- Public visitors land on `/` (the portfolio).
- Admin login is at `/edit` (`ADMIN_USERNAME` + `ADMIN_PASSWORD` from `.env`).
- After login, `/admin/dashboard` shows a snapshot of profile, projects, and gallery.
