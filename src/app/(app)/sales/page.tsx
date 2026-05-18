import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordSale } from "./actions";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const user = await requireUser();
  const [runs, sales] = await Promise.all([
    prisma.productionRun.findMany({
      where: { userId: user.id },
      orderBy: { producedAt: "desc" },
      include: { recipe: { include: { jar: true, sticker: true } }, sales: true },
    }),
    prisma.sale.findMany({
      where: { userId: user.id },
      orderBy: { soldAt: "desc" },
      include: { production: { include: { recipe: true } } },
      take: 50,
    }),
  ]);

  const available = runs
    .map((r) => ({ ...r, sold: r.sales.reduce((s, x) => s + x.quantity, 0) }))
    .filter((r) => r.quantity - r.sold > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sales</h1>

      <div className="rounded border bg-white p-4">
        <h2 className="text-sm font-medium mb-2">Record a sale</h2>
        {available.length === 0 ? (
          <p className="text-sm text-gray-500">No finished candles available. Produce some first.</p>
        ) : (
          <form action={recordSale} className="flex flex-wrap gap-2 items-end">
            <label className="text-sm">
              From production
              <select name="productionId" required className="block w-full sm:w-80 mt-1 border rounded px-2 py-1">
                {available.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.recipe.name} — {r.recipe.jar.name} / {r.recipe.sticker.name} ({r.quantity - r.sold} avail) — {new Date(r.producedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Qty
              <input name="quantity" type="number" min="1" step="1" defaultValue={1} className="block w-20 mt-1 border rounded px-2 py-1" />
            </label>
            <label className="text-sm">
              Unit price
              <input name="unitPrice" type="number" step="0.01" defaultValue={available[0].recipe.salePrice} className="block w-28 mt-1 border rounded px-2 py-1" />
            </label>
            <button className="px-4 py-2 rounded bg-black text-white text-sm">Record</button>
          </form>
        )}
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Recent sales</h2>
        <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white border rounded min-w-[40rem]">
          <thead className="text-left text-gray-600 border-b">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Recipe</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit price</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">COGS</th>
              <th className="p-3">Profit</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && <tr><td colSpan={7} className="p-3 text-gray-500">No sales yet.</td></tr>}
            {sales.map((s) => {
              const rev = s.unitPrice * s.quantity;
              const cogs = s.cogsPerUnit * s.quantity;
              return (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="p-3">{new Date(s.soldAt).toLocaleString()}</td>
                  <td className="p-3">{s.production.recipe.name}</td>
                  <td className="p-3">{s.quantity}</td>
                  <td className="p-3">{money(s.unitPrice)}</td>
                  <td className="p-3">{money(rev)}</td>
                  <td className="p-3">{money(cogs)}</td>
                  <td className={`p-3 ${rev - cogs < 0 ? "text-red-600" : ""}`}>{money(rev - cogs)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
