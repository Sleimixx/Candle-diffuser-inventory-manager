# Candle Shop Inventory Manager

Inventory, production, and sales tracker for a small candle shop.

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Prisma + Postgres (Supabase recommended)
- Server actions for all mutations
- Deploys to Vercel

## Domain rules
- **5 wax types**: Beeswax, Soy Wax, Stearic Acid, Coconut Wax, Paraffin (optional per recipe).
- **Scents** are added by the user; measured in ml; recipes can blend multiple scents.
- **Wicks** (Type 1 / Type 2) and **Wick Stickers** (single size) are consumed by these hard-coded rules:
  - Small jar  → 1 × Wick Type 1 + 1 × Wick Sticker
  - Medium jar → 2 × Wick Type 2 + 2 × Wick Stickers
  - Large jar  → 3 × Wick Type 2 + 3 × Wick Stickers
- **Jars / Stickers** come in 3 sizes × 7 colors, each color tied to one scent line (strict pairing):
  - Purple → Lavender Bliss
  - Light Blue → Tranquil Jasmine
  - Red → Vanilla Bourbon
  - Green → Pine and Cinnamon
  - Yellow → Pomelo Paradise
  - Grey → Sacred Oud
  - Pink → Silk n Strawberry
- A **recipe** is identified by (jar size, color). Producing a recipe atomically deducts wax, scents, jar, sticker, wicks, and wick stickers. Production records a **COGS snapshot** so reports stay correct when costs change later.
- **Sales** are recorded against a production run. Net income = revenue − snapshot COGS.

## Low-stock alerts
- Jars / stickers: below 20 pcs
- Wicks / wick stickers: below 20 pcs
- Wax: below 10 000 g (10 kg)
- Scents: no alert

## Getting started

```bash
# 1. Install deps
npm install

# 2. Configure Supabase / Postgres
cp .env.example .env
#   → set DATABASE_URL and DIRECT_URL

# 3. Push schema & seed
npm run db:push
npm run db:seed

# 4. Run dev server
npm run dev
```

Open http://localhost:3000.

## Pages
- `/` — Dashboard with totals + low-stock alerts
- `/inventory` — Wax, Scents, Wicks, Wick Stickers, Jars, Stickers (CRUD + restock)
- `/recipes` — Recipe list + builder (live cost preview)
- `/produce` — Log a production run; deducts stock atomically
- `/sales` — Record a sale from a production run
- `/reports` — Date-range filter, totals & per-recipe breakdown
