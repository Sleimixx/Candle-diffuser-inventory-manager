import { prisma } from "@/lib/prisma";
import { createScent, updateScent, deleteScent } from "../actions";
import { money, num } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ScentsPage() {
  const scents = await prisma.scent.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Scents (ml)</h1>

      <div className="rounded border bg-white p-4">
        <div className="text-sm font-medium mb-2">Add scent</div>
        <form action={createScent} className="flex flex-wrap gap-2 items-center">
          <input name="name"           required placeholder="Name (e.g. Bergamot)" className="border rounded px-2 py-1" />
          <input name="unitCostPerMl"  type="number" step="0.0001" placeholder="$/ml" className="w-24 border rounded px-2 py-1" />
          <input name="stockMl"        type="number" step="1"      placeholder="Starting ml" className="w-32 border rounded px-2 py-1" />
          <button className="px-3 py-1 rounded bg-black text-white">Add</button>
        </form>
      </div>

      <table className="w-full text-sm bg-white border rounded">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Scent</th>
            <th className="p-3">Stock</th>
            <th className="p-3">$/ml</th>
            <th className="p-3">Cost-set / Restock</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {scents.length === 0 && (
            <tr><td colSpan={5} className="p-3 text-gray-500">No scents yet. Add one above.</td></tr>
          )}
          {scents.map((s) => (
            <tr key={s.id} className="border-b last:border-0">
              <td className="p-3">{s.name}</td>
              <td className="p-3">{num(s.stockMl)} ml</td>
              <td className="p-3">{money(s.unitCostPerMl)}</td>
              <td className="p-3">
                <form action={updateScent} className="flex gap-2 items-center">
                  <input type="hidden" name="id" value={s.id} />
                  <input name="unitCostPerMl" type="number" step="0.0001" defaultValue={s.unitCostPerMl} className="w-24 border rounded px-2 py-1" />
                  <input name="addMl"         type="number" step="1" placeholder="+ ml" className="w-24 border rounded px-2 py-1" />
                  <button className="px-3 py-1 rounded bg-black text-white">Save</button>
                </form>
              </td>
              <td className="p-3">
                <form action={deleteScent}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-red-600 text-xs">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
