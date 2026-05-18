import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWax, updateWax, deleteWax } from "../actions";
import { LOW_STOCK } from "@/lib/constants";
import { money, num } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function WaxPage() {
  const user = await requireUser();
  const waxes = await prisma.waxType.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Wax (grams)</h1>

      <div className="rounded border bg-white p-4">
        <div className="text-sm font-medium mb-2">Add wax type</div>
        <form action={createWax} className="flex flex-wrap gap-2 items-center">
          <input name="name"          required placeholder="Name (e.g. Beeswax)" className="border rounded px-2 py-1" />
          <input name="unitCostPerG"  type="number" step="0.0001" placeholder="$/g" className="w-24 border rounded px-2 py-1" />
          <input name="stockGrams"    type="number" step="1"      placeholder="Starting g" className="w-32 border rounded px-2 py-1" />
          <label className="text-sm flex items-center gap-1">
            <input name="isOptional" type="checkbox" /> optional in recipes
          </label>
          <button className="px-3 py-1 rounded bg-black text-white">Add</button>
        </form>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[36rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Wax</th>
            <th className="p-3">Stock</th>
            <th className="p-3">$/g</th>
            <th className="p-3">Cost-set / Restock</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {waxes.length === 0 && (
            <tr><td colSpan={5} className="p-3 text-gray-500">No wax types yet. Add one above.</td></tr>
          )}
          {waxes.map((w) => {
            const low = w.stockGrams < LOW_STOCK.waxGrams;
            return (
              <tr key={w.id} className="border-b last:border-0">
                <td className="p-3">
                  {w.name}{" "}
                  {w.isOptional && <span className="text-xs text-gray-500">(optional)</span>}
                </td>
                <td className={`p-3 ${low ? "text-red-600" : ""}`}>{num(w.stockGrams)} g</td>
                <td className="p-3">{money(w.unitCostPerG)}</td>
                <td className="p-3">
                  <form action={updateWax} className="flex gap-2 items-center">
                    <input type="hidden" name="id" value={w.id} />
                    <input name="unitCostPerG" type="number" step="0.0001" defaultValue={w.unitCostPerG} className="w-24 border rounded px-2 py-1" />
                    <input name="addGrams"     type="number" step="1"      placeholder="+ grams" className="w-28 border rounded px-2 py-1" />
                    <button className="px-3 py-1 rounded bg-black text-white">Save</button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={deleteWax}>
                    <input type="hidden" name="id" value={w.id} />
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
