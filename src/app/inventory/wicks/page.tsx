import { prisma } from "@/lib/prisma";
import { updateWick } from "../actions";
import { LOW_STOCK, WICK_LABEL } from "@/lib/constants";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function WicksPage() {
  const wicks = await prisma.wick.findMany({ orderBy: { type: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wicks</h1>
      <p className="text-xs text-gray-500">
        Production rules: Small jar uses 1 × Type 1; Medium uses 2 × Type 2; Large uses 3 × Type 2.
      </p>
      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[32rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Wick</th>
            <th className="p-3">Stock</th>
            <th className="p-3">$/unit</th>
            <th className="p-3">Cost-set / Restock</th>
          </tr>
        </thead>
        <tbody>
          {wicks.map((w) => {
            const low = w.stockQty < LOW_STOCK.wickQty;
            return (
              <tr key={w.id} className="border-b last:border-0">
                <td className="p-3">{WICK_LABEL[w.type]}</td>
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
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
