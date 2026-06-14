# Workflow & Folder Structure Templates

Use this during Stage 3C to generate the correct folder structure for the chosen stack.

---

## Next.js (App Router) — Most Common Choice

```
my-project/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   └── [feature]/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # Generic components (Button, Input, Modal)
│   ├── layout/              # Navbar, Footer, Sidebar
│   └── [feature]/           # Feature-specific components
├── lib/
│   ├── db.ts                # Database client (Supabase / Prisma)
│   ├── auth.ts              # Auth config
│   └── utils.ts             # Shared helpers
├── hooks/                   # Custom React hooks (useUser, useCart, etc.)
├── types/                   # TypeScript interfaces and types
├── public/                  # Static assets
│   ├── images/
│   └── icons/
├── prisma/                  # If using Prisma ORM
│   ├── schema.prisma
│   └── migrations/
├── .env.local               # Secret keys — never commit!
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Key conventions:**
- Route groups `(auth)` and `(dashboard)` group pages without affecting the URL
- `app/api/` routes are your backend — each `route.ts` file is an API endpoint
- Keep components small — if a component is >150 lines, split it

---

## Next.js + Separate Node.js Backend (Full-Stack Decoupled)

```
my-project/
├── frontend/                # Next.js app
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   └── api.ts           # All calls to backend go through here
│   ├── .env.local           # NEXT_PUBLIC_API_URL=...
│   └── package.json
│
├── backend/                 # Node.js / Express API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── auth.ts
│   │   │   └── [feature].ts
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth checks, rate limiting, validation
│   │   │   ├── authenticate.ts
│   │   │   └── rateLimit.ts
│   │   ├── models/          # Database models / queries
│   │   ├── services/        # External integrations (email, payments)
│   │   ├── utils/           # Helper functions
│   │   └── app.ts           # Express app setup
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env                 # DB_URL, JWT_SECRET, etc. — never commit!
│   └── package.json
│
├── .gitignore
└── README.md
```

**Key conventions:**
- Frontend only talks to backend through `lib/api.ts` — never call DB directly from frontend
- All auth checks happen in `middleware/authenticate.ts`
- Never put business logic in route handlers — put it in controllers

---

## Next.js + Supabase (No Separate Backend)

```
my-project/
├── app/
│   ├── (auth)/
│   ├── (protected)/         # Pages requiring login
│   ├── api/
│   │   └── webhooks/        # Only for external webhooks (Stripe, etc.)
│   └── page.tsx
├── components/
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser-side Supabase client
│   │   └── server.ts        # Server-side Supabase client
│   └── utils.ts
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed.sql             # Initial data
├── .env.local               # SUPABASE_URL and SUPABASE_ANON_KEY
└── package.json
```

**Key conventions:**
- Use Supabase Row Level Security (RLS) — it's your backend auth layer
- `lib/supabase/server.ts` for server components, `client.ts` for browser components
- Never expose your `service_role` key in frontend code

---

## Python FastAPI Backend (for AI/data-heavy projects)

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/
│   │       │   ├── auth.py
│   │       │   └── [feature].py
│   │       └── router.py
│   ├── core/
│   │   ├── config.py        # Settings from environment variables
│   │   ├── security.py      # Password hashing, JWT
│   │   └── database.py      # DB connection
│   ├── models/              # SQLAlchemy / Pydantic models
│   ├── schemas/             # Request/response schemas
│   ├── services/            # Business logic
│   └── main.py              # App entry point
├── tests/
├── .env                     # DATABASE_URL, SECRET_KEY, etc.
├── requirements.txt
└── Dockerfile
```

**Key conventions:**
- `schemas/` defines what data comes IN and goes OUT of the API
- `models/` defines the database structure
- `services/` contains all business logic — routes just call services

---

## Static Site (Astro / HTML — no backend)

```
my-project/
├── src/
│   ├── pages/               # Each .astro file = one page
│   │   ├── index.astro      # Home page → yoursite.com/
│   │   ├── about.astro      # → yoursite.com/about
│   │   └── blog/
│   │       ├── index.astro  # Blog list page
│   │       └── [slug].astro # Individual blog post
│   ├── components/          # Reusable UI pieces
│   ├── layouts/             # Page templates
│   │   └── BaseLayout.astro
│   ├── content/             # Markdown blog posts / content
│   │   └── blog/
│   │       └── post-1.md
│   └── styles/              # Global CSS
├── public/                  # Static files (images, fonts)
├── astro.config.mjs
└── package.json
```

---

## CI/CD Workflow Templates

### GitHub Actions — Auto-deploy to Vercel on push to main

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm test         # Never deploy if tests fail
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### GitHub Actions — Run tests on every Pull Request

```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

---

## Git Branching Strategies

### Solo Developer
```
main     ← production (always live and stable)
  └── dev  ← your daily work branch
        └── feature/login
        └── feature/payment
        └── fix/broken-button
```
**Rule:** Only merge to `main` when you're sure it works.

### Small Team (2–5 devs)
```
main         ← production
  └── staging  ← testing before release
        └── dev  ← integration branch
              └── feature/[name]   ← one per feature
              └── fix/[bug-name]   ← one per bug fix
```
**Rule:** All PRs go to `dev` first. Staging is for final QA. Only release manager merges to `main`.

### Naming Conventions
- New feature: `feature/user-authentication`
- Bug fix: `fix/login-redirect-broken`
- Hotfix (urgent production fix): `hotfix/payment-crash`
- Chore (no code change): `chore/update-dependencies`

---

## Environment Variables — What Goes Where

```
# .env.local (Next.js) or .env (Node/Python)
# NEVER commit this file to Git — it's in .gitignore

# Database
DATABASE_URL="postgresql://user:password@host:5432/mydb"

# Authentication
NEXTAUTH_SECRET="a-long-random-string-generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"

# Supabase (if used)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."    # Safe to expose
SUPABASE_SERVICE_ROLE_KEY="eyJ..."        # NEVER expose in frontend!

# Payments
STRIPE_SECRET_KEY="sk_live_..."           # Backend only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Frontend safe

# Email
RESEND_API_KEY="re_..."
```

**Rule:** Variables starting with `NEXT_PUBLIC_` are visible in the browser. Everything else is server-only. Never put secrets in `NEXT_PUBLIC_` variables.
