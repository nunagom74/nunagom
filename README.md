# Nuna Gom - Handmade Knitted Bear Store

A minimalist e-commerce site for selling handmade knitted bears, built with Next.js 14, TypeScript, TailwindCSS, and PostgreSQL (Prisma).

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Simple Admin Session (JWT Cookies)
- **Deployment**: Vercel (Recommended)

## Getting Started

### 1. Prerequisites
- Node.js 18+
- Docker (or Podman) for local database

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL` and `ADMIN_PASSWORD` as needed.

### 3. Database Setup
Start PostgreSQL using Docker/Podman:
```bash
# Docker
docker-compose up -d

# Podman
podman run -d --name nuna-gom-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=nuna_gom -p 5432:5432 postgres:15-alpine
```

Run migrations and seed data:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Admin Dashboard
- URL: `/admin`
- Default Login:
  - Email: `admin@nunagom.com` (from `.env`)
  - Password: `securepassword123` (from `.env`)

From the dashboard, you can:
- Manage Products (Create, Edit, Delete)
- Upload Images (Stored in `/public/uploads` for MVP)
- View Orders and Inquiries

## Deployment
1. Push code to GitHub.
2. Connect project to Vercel.
3. Configure Environment Variables in Vercel (`DATABASE_URL`, `ADMIN_PASSWORD`, etc.).
   - *Note*: Use a cloud database like Neon.tech or Supabase for production PostgreSQL.
4. Set Build Command: `npx prisma migrate deploy && next build` (or run migrations separately).

## License
MIT
