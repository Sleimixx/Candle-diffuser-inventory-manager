# Inventory & Sales Manager

Inventory, production, and sales tracker for any small business.

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Prisma + Postgres (Supabase)
- Server actions for all mutations
- Deploys to Vercel

## Features
- **Multi-tenant** — each user signs up with a shop name and manages their own data.
- **User-defined categories** — create categories with any unit (g, ml, pcs, ft, etc.) and add items to each.
- **Recipes** — combine items from any category with a quantity per unit produced.
- **Production** — atomically deducts all recipe items and snapshots COGS per unit.
- **Sales** — record against a production run; tracks revenue and frozen COGS.
- **Reports** — date-range filter with produced / sold / revenue / net totals.


## Pages
- `/` — Dashboard with revenue / COGS / profit / margin
- `/inventory` — Categories and items (CRUD + restock)
- `/recipes` — Recipe list + builder (live cost preview)
- `/produce` — Log a production run; deducts stock atomically
- `/sales` — Record a sale from a production run
- `/reports` — Date-range filter with totals
