# Candle Shop Inventory Manager

## Common commands
- `npm run dev` — start dev server at http://localhost:3000
- `npm run build` — production build
- `npm run db:push` — sync Prisma schema to the database (run after schema changes)
- `npm run db:seed` — seed wax types, wicks, jars, stickers (safe to re-run; uses upsert)
- `npm run db:studio` — open Prisma Studio to browse/edit data visually

## Stack
- Next.js 15 App Router, TypeScript, Tailwind CSS
- Prisma ORM with SQLite (`prisma/dev.db`) for local dev
- Server Actions for all mutations (no separate API routes)
- No auth — single-user app

## Project structure
- `prisma/schema.prisma` — database schema
- `prisma/seed.ts` — seeds static data (waxes, wicks, jars, stickers)
- `src/lib/constants.ts` — domain types (JarSize, LineColor, WickType), color-to-scent-line map, low-stock thresholds, wick rules
- `src/lib/cogs.ts` — COGS calculation logic
- `src/lib/prisma.ts` — Prisma client singleton
- `src/lib/money.ts` — number formatting helpers
- `src/app/` — pages and server actions, one folder per route

## Domain rules (do not change without asking)
- **5 wax types**: Beeswax, Soy Wax, Stearic Acid, Coconut Wax, Paraffin. Paraffin is optional per recipe (`isOptional: true`).
- **Scents** are user-managed; measured in ml.
- **Wick rules** (hard-coded in `wickRuleFor()` in constants.ts):
  - Small jar → 1 × Wick Type 1 + 1 × Wick Sticker
  - Medium jar → 2 × Wick Type 2 + 2 × Wick Stickers
  - Large jar → 3 × Wick Type 2 + 3 × Wick Stickers
- **Strict color/scent-line pairing** — each of 7 colors maps to exactly one scent line. Jar color = sticker color = scent line. This is enforced at the recipe level (`@@unique([jarSize, color])` on `CandleRecipe`).
- **7 product lines**: Purple=Lavender Bliss, Light Blue=Tranquil Jasmine, Red=Vanilla Bourbon, Green=Pine and Cinnamon, Yellow=Pomelo Paradise, Grey=Sacred Oud, Pink=Silk n Strawberry.
- **Production** atomically deducts all materials in a single transaction and saves a `cogsPerUnit` snapshot so sales reports stay accurate even if costs change later.
- **Low-stock thresholds**: jars/stickers/wicks/wick stickers below 20 pcs; wax below 10 000 g. Scents have no alert.

## Schema notes
- SQLite is used locally; fields that would be Postgres enums are `String` in the schema. The TypeScript union types (`JarSize`, `LineColor`, `WickType`) live in `src/lib/constants.ts` — do NOT import them from `@prisma/client`.
- To migrate to Postgres (e.g. Supabase for production), change the datasource provider back to `postgresql`, add `directUrl`, restore enum blocks, and update `constants.ts` to import from `@prisma/client`.
- Composite unique keys on `Jar` and `Sticker`: `@@unique([size, color])` → accessed in Prisma as `size_color: { size, color }`.
