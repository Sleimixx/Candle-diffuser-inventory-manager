import { prisma } from "@/lib/prisma";
import { updateWax } from "../actions";
import { LOW_STOCK } from "@/lib/constants";
import { money, num } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function WaxPage() {
  const waxes = await prisma.waxType.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wax (grams)</h1>
      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[36rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Wax</th>
            <th className="p-3">Stock</th>
            <th className="p-3">$/g</th>
            <th className="p-3">Cost-set / Restock</th>
          </tr>
        </thead>
        <tbody>
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
                    <input
                      name="unitCostPerG"
                      type="number"
                      step="0.0001"
                      defaultValue={w.unitCostPerG}
                      className="w-24 border rounded px-2 py-1"
                    />
                    <input
                      name="addGrams"
                      type="number"
                      step="1"
                      placeholder="+ grams"
                      className="w-28 border rounded px-2 py-1"
                    />
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
