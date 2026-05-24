# Inventory & Sales Manager

## Common commands
- `npm run dev` — start dev server at http://localhost:3000
- `npm run build` — production build
- `npm run db:push` — sync Prisma schema to the database (run after schema changes)
- `npm run db:studio` — open Prisma Studio to browse/edit data visually

## Stack
- Next.js 15 App Router, TypeScript, Tailwind CSS
- Prisma ORM with PostgreSQL (Supabase) for production
- Server Actions for all mutations (no separate API routes)
- JWT auth (username + email + password), multi-tenant shared DB with userId on every table

## Project structure
- `prisma/schema.prisma` — database schema
- `src/lib/cogs.ts` — COGS calculation logic (sum of recipe item costs)
- `src/lib/prisma.ts` — Prisma client singleton
- `src/lib/money.ts` — number formatting helpers
- `src/lib/auth.ts` — password hashing, JWT sessions, requireUser
- `src/app/` — pages and server actions, one folder per route

## Domain model
- **User** signs up with shop name, username, email, password. Each user sees only their own data.
- **Categories** are user-defined (e.g. "Wax", "Fabric", "Paint"). Each has a unit (g, ml, pcs, etc.).
- **Items** belong to a category. Track name, stock (Float), unit cost.
- **Recipes** combine items from any category with a qty per unit produced.
- **Production** atomically deducts all recipe items in a single transaction and saves a `cogsPerUnit` snapshot so sales reports stay accurate even if costs change later.
- **Sales** are recorded against a production run; track quantity, unit price, and frozen COGS.
