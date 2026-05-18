import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWick, updateWick, deleteWick } from "../actions";
import { LOW_STOCK } from "@/lib/constants";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function WicksPage() {
  const user = await requireUser();
  const wicks = await prisma.wick.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Wicks</h1>
      <p className="text-xs text-gray-500">
        Wick consumption per candle is controlled by the wick rules in <a className="underline" href="/setup/wick-rules">Setup → Wick rules</a>.
      </p>

      <div className="rounded border bg-white p-4">
        <div className="text-sm font-medium mb-2">Add wick type</div>
        <form action={createWick} className="flex flex-wrap gap-2 items-center">
          <input name="name"      required placeholder="Name (e.g. Type 1)" className="border rounded px-2 py-1" />
          <input name="unitCost"  type="number" step="0.01" placeholder="$/unit" className="w-24 border rounded px-2 py-1" />
          <input name="stockQty"  type="number" step="1"    placeholder="Starting pcs" className="w-32 border rounded px-2 py-1" />
          <button className="px-3 py-1 rounded bg-black text-white">Add</button>
        </form>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[32rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Wick</th>
            <th className="p-3">Stock</th>
            <th className="p-3">$/unit</th>
            <th className="p-3">Cost-set / Restock</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {wicks.length === 0 && (
            <tr><td colSpan={5} className="p-3 text-gray-500">No wicks yet. Add one above.</td></tr>
          )}
          {wicks.map((w) => {
            const low = w.stockQty < LOW_STOCK.wickQty;
            return (
              <tr key={w.id} className="border-b last:border-0">
                <td className="p-3">{w.name}</td>
                <td className={`p-3 ${low ? "text-red-600" : ""}`}>{w.stockQty} pcs</td>
                <td className="p-3">{money(w.unitCost)}</td>
                <td className="p-3">
                  <form action={updateWick} className="flex gap-2 items-center">
                    <input type="hidden" name="id" value={w.id} />
                    <input name="unitCost" type="number" step="0.01" defaultValue={w.unitCost} className="w-24 border rounded px-2 py-1" />
                    <input name="addQty"   type="number" step="1"   placeholder="+ pcs"     className="w-24 border rounded px-2 py-1" />
                    <button className="px-3 py-1 rounded bg-black text-white">Save</button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={deleteWick}>
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
