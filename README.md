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

2. Set up environment variables in a `.env` file:

```bash
DATABASE_URL="<your Neon Postgres connection string>"
GROQ_API_KEY="<your Groq API key>"
NEXTAUTH_SECRET="<random-long-secret>"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="<admin login email>"
ADMIN_PASSWORD="<admin login password>"
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

### Admin panel

- Public visitors land on `/` (the portfolio).
- Admin login is at `/admin/login` (email + password from `.env`).
- After login, `/admin/dashboard` shows a snapshot of profile, projects, and gallery.

