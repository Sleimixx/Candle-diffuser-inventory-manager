import { prisma } from "@/lib/prisma";
import { COLOR_LINES, SIZE_LABEL } from "@/lib/constants";
import { money, num } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const from = sp.from ? new Date(sp.from) : new Date(Date.now() - 30 * 86400000);
  const to   = sp.to   ? new Date(sp.to)   : new Date();

  const [sales, runs] = await Promise.all([
    prisma.sale.findMany({
      where: { soldAt: { gte: from, lte: to } },
      include: { production: { include: { recipe: true } } },
    }),
    prisma.productionRun.findMany({
      where: { producedAt: { gte: from, lte: to } },
      include: { recipe: true },
    }),
  ]);

  const revenue = sales.reduce((s, x) => s + x.quantity * x.unitPrice, 0);
  const cogs    = sales.reduce((s, x) => s + x.quantity * x.cogsPerUnit, 0);
  const profit  = revenue - cogs;
  const margin  = revenue > 0 ? (profit / revenue) * 100 : 0;
  const produced = runs.reduce((s, r) => s + r.quantity, 0);
  const soldQty  = sales.reduce((s, x) => s + x.quantity, 0);

  // Per-recipe breakdown
  const perRecipe = new Map<string, { name: string; revenue: number; cogs: number; qty: number }>();
  for (const s of sales) {
    const k = s.production.recipeId;
    const r = perRecipe.get(k) ?? { name: s.production.recipe.name, revenue: 0, cogs: 0, qty: 0 };
    r.revenue += s.quantity * s.unitPrice;
    r.cogs    += s.quantity * s.cogsPerUnit;
    r.qty     += s.quantity;
    perRecipe.set(k, r);
  }
  const breakdown = [...perRecipe.values()].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <form className="rounded border bg-white p-3 flex gap-2 items-end">
        <label className="text-sm">From <input name="from" type="date" defaultValue={from.toISOString().slice(0, 10)} className="block border rounded px-2 py-1" /></label>
        <label className="text-sm">To   <input name="to"   type="date" defaultValue={to.toISOString().slice(0, 10)}   className="block border rounded px-2 py-1" /></label>
        <button className="px-3 py-1 rounded bg-black text-white text-sm">Filter</button>
      </form>

      <section className="grid grid-cols-4 gap-3">
        <Stat label="Produced" value={`${num(produced)} candles`} />
        <Stat label="Sold"     value={`${num(soldQty)} candles`} />
        <Stat label="Revenue"  value={money(revenue)} />
        <Stat label="Net"      value={`${money(profit)} (${num(margin, 1)}%)`} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">By recipe</h2>
        <table className="w-full text-sm bg-white border rounded">
          <thead className="text-left text-gray-600 border-b">
            <tr>
              <th className="p-3">Recipe</th>
              <th className="p-3">Sold</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">COGS</th>
              <th className="p-3">Profit</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.length === 0 && <tr><td colSpan={5} className="p-3 text-gray-500">No sales in this range.</td></tr>}
            {breakdown.map((b) => (
              <tr key={b.name} className="border-b last:border-0">
                <td className="p-3">{b.name}</td>
                <td className="p-3">{b.qty}</td>
                <td className="p-3">{money(b.revenue)}</td>
                <td className="p-3">{money(b.cogs)}</td>
                <td className={`p-3 ${b.revenue - b.cogs < 0 ? "text-red-600" : ""}`}>{money(b.revenue - b.cogs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-white p-3">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
