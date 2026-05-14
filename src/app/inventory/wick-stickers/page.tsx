import { prisma } from "@/lib/prisma";
import { updateWickSticker } from "../actions";
import { LOW_STOCK } from "@/lib/constants";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function WickStickerPage() {
  const ws = await prisma.wickSticker.findFirst();
  if (!ws) return <div>Run the seed: <code>npm run db:seed</code></div>;
  const low = ws.stockQty < LOW_STOCK.wickStickerQty;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wick stickers</h1>
      <p className="text-xs text-gray-500">
        One sticker per wick. Small jar = 1 wick sticker, Medium = 2, Large = 3.
      </p>
      <div className="rounded border bg-white p-4 max-w-md space-y-3">
        <div className="flex justify-between text-sm">
          <span>Stock</span>
          <span className={low ? "text-red-600 font-medium" : ""}>{ws.stockQty} pcs</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Unit cost</span>
          <span>{money(ws.unitCost)}</span>
        </div>
        <form action={updateWickSticker} className="flex gap-2 items-center pt-2">
          <input type="hidden" name="id" value={ws.id} />
          <input name="unitCost" type="number" step="0.01" defaultValue={ws.unitCost} className="w-24 border rounded px-2 py-1" />
          <input name="addQty"   type="number" step="1"   placeholder="+ pcs"     className="w-24 border rounded px-2 py-1" />
          <button className="px-3 py-1 rounded bg-black text-white">Save</button>
        </form>
      </div>
    </div>
  );
}
