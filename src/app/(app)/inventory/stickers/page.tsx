import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSticker, updateSticker, deleteSticker } from "../actions";
import { LOW_STOCK } from "@/lib/constants";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function StickersPage() {
  const user = await requireUser();
  const stickers = await prisma.sticker.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Stickers</h1>

      <div className="rounded border bg-white p-4">
        <div className="text-sm font-medium mb-2">Add sticker</div>
        <form action={createSticker} className="flex flex-wrap gap-2 items-center">
          <input name="name"     required placeholder="Name (e.g. Lavender label)" className="border rounded px-2 py-1" />
          <input name="unitCost" type="number" step="0.01" placeholder="$/unit"   className="w-24 border rounded px-2 py-1" />
          <input name="stockQty" type="number" step="1"    placeholder="Starting pcs" className="w-32 border rounded px-2 py-1" />
          <button className="px-3 py-1 rounded bg-black text-white">Add</button>
        </form>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[32rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Sticker</th>
            <th className="p-3">Stock</th>
            <th className="p-3">$/unit</th>
            <th className="p-3">Cost-set / Restock</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {stickers.length === 0 && (
            <tr><td colSpan={5} className="p-3 text-gray-500">No stickers yet. Add one above.</td></tr>
          )}
          {stickers.map((s) => {
            const low = s.stockQty < LOW_STOCK.stickerQty;
            return (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3">{s.name}</td>
                <td className={`p-3 ${low ? "text-red-600" : ""}`}>{s.stockQty} pcs</td>
                <td className="p-3">{money(s.unitCost)}</td>
                <td className="p-3">
                  <form action={updateSticker} className="flex gap-2 items-center">
                    <input type="hidden" name="id" value={s.id} />
                    <input name="unitCost" type="number" step="0.01" defaultValue={s.unitCost} className="w-24 border rounded px-2 py-1" />
                    <input name="addQty"   type="number" step="1"   placeholder="+ pcs"     className="w-24 border rounded px-2 py-1" />
                    <button className="px-3 py-1 rounded bg-black text-white">Save</button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={deleteSticker}>
                    <input type="hidden" name="id" value={s.id} />
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
