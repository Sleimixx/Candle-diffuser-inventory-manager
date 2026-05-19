import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runProduction } from "./actions";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProducePage() {
  const user = await requireUser();
  const recipes = await prisma.recipe.findMany({
    where: { userId: user.id },
    orderBy: [{ name: "asc" }],
  });
  const runs = await prisma.productionRun.findMany({
    where: { userId: user.id },
    orderBy: { producedAt: "desc" },
    include: { recipe: true, sales: true },
    take: 25,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Produce</h1>

      <form action={runProduction} className="rounded border bg-white p-4 flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          Recipe
          <select name="recipeId" required className="block w-full sm:w-72 mt-1 border rounded px-2 py-1">
            {recipes.length === 0 && <option value="">— no recipes —</option>}
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Quantity
          <input name="quantity" type="number" min="1" step="1" defaultValue={1} className="block w-24 mt-1 border rounded px-2 py-1" />
        </label>
        <button className="px-4 py-2 rounded bg-black text-white text-sm" disabled={recipes.length === 0}>
          Produce
        </button>
      </form>

      <div>
        <h2 className="text-lg font-medium mb-2">Recent runs</h2>
        <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white border rounded min-w-[36rem]">
          <thead className="text-left text-gray-600 border-b">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Recipe</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Sold</th>
              <th className="p-3">Available</th>
              <th className="p-3">COGS/unit</th>
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 && <tr><td colSpan={6} className="p-3 text-gray-500">No production yet.</td></tr>}
            {runs.map((r) => {
              const sold = r.sales.reduce((s, x) => s + x.quantity, 0);
              const avail = r.quantity - sold;
              return (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3">{new Date(r.producedAt).toLocaleString()}</td>
                  <td className="p-3">{r.recipe.name}</td>
                  <td className="p-3">{r.quantity}</td>
                  <td className="p-3">{sold}</td>
                  <td className="p-3">{avail}</td>
                  <td className="p-3">{money(r.cogsPerUnit)}</td>
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
