# Tech Stack Reference Guide

Use this file during Stage 1 to map a user's project description to the best-fit stack.

---

## Stack Selection Matrix

### By Project Type

| Project Type | Frontend | Backend | Database | Auth | Hosting |
|---|---|---|---|---|---|
| Personal Blog / Portfolio | Next.js or Astro | None needed (static) | None / Markdown files | N/A | Vercel / Netlify (free) |
| Small Business Site | Next.js | None or Supabase | Supabase (Postgres) | Supabase Auth | Vercel |
| E-commerce (small) | Next.js | Next.js API Routes | Supabase / PlanetScale | Clerk or NextAuth | Vercel |
| E-commerce (large) | Next.js | Node.js / NestJS | PostgreSQL | Clerk | AWS / GCP |
| SaaS App | Next.js or React | Node.js / FastAPI | PostgreSQL | Clerk or Auth0 | Railway / Render / AWS |
| Social Platform | React / Next.js | Node.js / Go | PostgreSQL + Redis | Auth0 | AWS / GCP |
| Marketplace | Next.js | Node.js / Django | PostgreSQL | Auth0 | AWS |
| Dashboard / Internal Tool | React / Next.js | FastAPI / Node.js | PostgreSQL | NextAuth | Vercel / Railway |
| AI-powered App | Next.js | Python / FastAPI | PostgreSQL + Vector DB | Clerk | AWS / GCP |
| News / Content Site | Next.js (+ CMS) | Headless CMS | Contentful / Sanity | N/A | Vercel |
| Community / Forum | Next.js | Node.js | PostgreSQL | Clerk | Railway |

---

## Frontend Frameworks

### Next.js (React-based)
- **Best for**: Most websites — blogs, e-commerce, SaaS, dashboards
- **Why**: Full-stack capable, great SEO, huge community, deploys for free on Vercel
- **Difficulty**: Beginner-friendly with templates, intermediate to master
- **Learn**: nextjs.org/learn

### Astro
- **Best for**: Content-heavy sites, blogs, portfolios where speed is critical
- **Why**: Ships almost zero JavaScript — extremely fast, great SEO
- **Difficulty**: Beginner-friendly
- **Learn**: docs.astro.build

### React (without Next.js)
- **Best for**: Single-page apps, dashboards where SEO doesn't matter
- **Why**: Maximum flexibility, huge ecosystem
- **Difficulty**: Intermediate
- **Learn**: react.dev

### Vue.js / Nuxt.js
- **Best for**: Teams that prefer Vue syntax; good alternative to React
- **Why**: Gentle learning curve, great docs
- **Difficulty**: Beginner-friendly

### Vanilla HTML/CSS/JS
- **Best for**: Very simple sites, landing pages, prototypes
- **Why**: Zero dependencies, fastest to learn
- **Difficulty**: Beginner

---

## Backend Options

### Next.js API Routes (no separate backend)
- **Best for**: Small to medium apps, when you want one codebase
- **Why**: Eliminates the need for a separate backend server
- **Difficulty**: Beginner-friendly

### Node.js + Express
- **Best for**: REST APIs, real-time apps, custom backends
- **Why**: JavaScript everywhere (same language as frontend), massive ecosystem
- **Difficulty**: Beginner-intermediate

### Node.js + NestJS
- **Best for**: Large enterprise backends, teams that want structure
- **Why**: Opinionated, scalable, TypeScript-first
- **Difficulty**: Intermediate-advanced

### Python + FastAPI
- **Best for**: AI/ML integrations, data-heavy apps, APIs
- **Why**: Fastest Python framework, automatic API docs, excellent for AI features
- **Difficulty**: Beginner-intermediate

### Python + Django
- **Best for**: Content management, rapid prototyping, when you need admin panel out of the box
- **Why**: "Batteries included" — comes with ORM, admin, auth built in
- **Difficulty**: Beginner-intermediate

### Supabase (Backend-as-a-Service)
- **Best for**: Non-technical users, rapid development, projects with tight budgets
- **Why**: Gives you database + auth + storage + APIs with zero backend code
- **Difficulty**: Beginner (no backend code needed)

---

## Databases

### PostgreSQL
- **Best for**: Almost everything — relational data, structured data
- **Why**: Industry standard, reliable, scales well, free and open source
- **Hosted options**: Supabase, Neon, Railway, AWS RDS

### MongoDB
- **Best for**: Flexible/unstructured data, rapid prototyping, content with variable fields
- **Why**: Flexible schema, easy to start with
- **Hosted options**: MongoDB Atlas

### SQLite
- **Best for**: Very small apps, local development, prototypes
- **Why**: Zero config, file-based

### Redis
- **Best for**: Caching, sessions, real-time features (used ALONGSIDE a main DB)
- **Why**: Extremely fast in-memory storage

---

## Authentication (Login / Sign-up Systems)

### Clerk
- **Best for**: SaaS apps, apps that need social login, non-tech developers
- **Why**: Beautiful pre-built UI, handles everything (MFA, social, magic links), generous free tier
- **Difficulty**: Beginner — drop in and done

### Supabase Auth
- **Best for**: Apps already using Supabase
- **Why**: Integrated with the database, free, handles social logins
- **Difficulty**: Beginner

### NextAuth.js / Auth.js
- **Best for**: Next.js apps that want full control
- **Why**: Free, open source, works with any database
- **Difficulty**: Intermediate

### Auth0
- **Best for**: Enterprise apps, complex auth requirements
- **Why**: Very feature-rich, handles compliance requirements
- **Difficulty**: Intermediate (can get complex)

---

## Hosting & Deployment

### Vercel
- **Best for**: Next.js, React, frontend apps
- **Cost**: Free for personal/small projects; ~$20/mo for teams
- **Why**: One-click deploy from GitHub, automatic HTTPS, global CDN

### Netlify
- **Best for**: Static sites, Gatsby, frontend apps
- **Cost**: Free tier available
- **Why**: Easy CI/CD, good free tier

### Railway
- **Best for**: Full-stack apps with a database
- **Cost**: ~$5/mo to start
- **Why**: Simple, deploys any language, managed databases

### Render
- **Best for**: Full-stack apps, APIs, background workers
- **Cost**: Free tier (sleeps on inactivity), paid from ~$7/mo
- **Why**: Easy Docker deployments, good for Node/Python backends

### AWS (Amazon Web Services)
- **Best for**: Large-scale production apps
- **Cost**: Pay-as-you-go (can be expensive at scale if not managed)
- **Why**: Industry standard, infinite scalability, all services available
- **Warning**: Complex — not recommended for beginners without DevOps help

### Google Cloud Platform (GCP)
- **Best for**: AI/ML workloads, large-scale apps
- **Cost**: Pay-as-you-go
- **Why**: Best AI/ML tools, Firebase integration

### DigitalOcean
- **Best for**: Developers who want simple VPS control
- **Cost**: From $4/mo
- **Why**: Simple pricing, good docs, less complex than AWS/GCP

---

## Budget Guide

| Budget | Stack Recommendation |
|---|---|
| $0 (Free only) | Next.js + Supabase free tier + Vercel free tier |
| Low ($5–$20/mo) | Next.js + Supabase or Railway + Vercel |
| Medium ($20–$100/mo) | Next.js + PostgreSQL on Railway/Render + Clerk |
| Flexible | Best-fit stack regardless of cost |

---

## Scale Guide

| Expected Users | Recommendation |
|---|---|
| < 1,000/mo | Supabase free tier + Vercel hobby — no infrastructure work needed |
| 1,000–50,000/mo | Supabase Pro or Railway + Vercel Pro |
| 50,000–500,000/mo | Managed PostgreSQL + Redis cache + CDN + auto-scaling needed |
| 500,000+/mo | AWS/GCP with DevOps team, load balancers, multi-region |
