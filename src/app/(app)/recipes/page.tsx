import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { computeCogsForRecipe } from "@/lib/cogs";
import { money } from "@/lib/money";
import { deleteRecipe } from "./actions";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const user = await requireUser();
  const recipes = await prisma.recipe.findMany({
    where: { userId: user.id },
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  const costs = await Promise.all(recipes.map((r) => computeCogsForRecipe(user.id, r.id)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recipes</h1>
        <Link href="/recipes/new" className="px-3 py-2 rounded bg-black text-white text-sm">New recipe</Link>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[36rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Recipe</th>
            <th className="p-3">Items</th>
            <th className="p-3">Sale price</th>
            <th className="p-3">Material cost</th>
            <th className="p-3">Margin</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {recipes.length === 0 && (
            <tr><td colSpan={6} className="p-3 text-gray-500">No recipes yet.</td></tr>
          )}
          {recipes.map((r, i) => {
            const cost = costs[i];
            const margin = r.salePrice > 0 ? ((r.salePrice - cost) / r.salePrice) * 100 : 0;
            return (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3">
                  <Link className="underline" href={`/recipes/${r.id}`}>{r.name}</Link>
                </td>
                <td className="p-3">{r._count.items}</td>
                <td className="p-3">{money(r.salePrice)}</td>
                <td className="p-3">{money(cost)}</td>
                <td className={`p-3 ${margin < 0 ? "text-red-600" : ""}`}>{margin.toFixed(1)}%</td>
                <td className="p-3">
                  <form action={deleteRecipe}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-red-600 text-xs">Delete</button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
