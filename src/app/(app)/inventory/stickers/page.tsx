import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateSticker } from "../actions";
import { LOW_STOCK } from "@/lib/constants";
import { money } from "@/lib/money";
import { ensureStickerMatrix } from "@/lib/matrix";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StickersPage() {
  const user = await requireUser();
  await ensureStickerMatrix(user.id);
  const [sizes, colors, stickers] = await Promise.all([
    prisma.jarSize.findMany({ where: { userId: user.id }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.jarColor.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.sticker.findMany({ where: { userId: user.id } }),
  ]);

  if (sizes.length === 0 || colors.length === 0) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Stickers</h1>
        <p className="text-sm text-gray-600">
          Add at least one jar size and one color in <Link href="/setup" className="underline">Setup</Link> first.
        </p>
      </div>
    );
  }

  const byKey = new Map(stickers.map((s) => [`${s.sizeId}|${s.colorId}`, s]));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Stickers</h1>
      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[44rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Color (Line)</th>
            {sizes.map((s) => <th key={s.id} className="p-3">{s.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {colors.map((c) => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: c.hex }} />
                  <div>
                    <div>{c.name}</div>
                    {c.scentLine && <div className="text-xs text-gray-500">{c.scentLine}</div>}
                  </div>
                </div>
              </td>
              {sizes.map((s) => {
                const st = byKey.get(`${s.id}|${c.id}`);
                if (!st) return <td key={s.id} className="p-3 text-xs text-gray-400">—</td>;
                const low = st.stockQty < LOW_STOCK.stickerQty;
                return (
                  <td key={s.id} className="p-3 align-top">
                    <div className={`text-sm ${low ? "text-red-600 font-medium" : ""}`}>{st.stockQty} pcs</div>
                    <div className="text-xs text-gray-500 mb-1">{money(st.unitCost)} each</div>
                    <form action={updateSticker} className="flex gap-1 items-center">
                      <input type="hidden" name="id" value={st.id} />
                      <input name="unitCost" type="number" step="0.01" defaultValue={st.unitCost} className="w-16 border rounded px-1 py-0.5 text-xs" />
                      <input name="addQty"   type="number" step="1" placeholder="+pcs" className="w-16 border rounded px-1 py-0.5 text-xs" />
                      <button className="px-2 py-0.5 rounded bg-black text-white text-xs">Save</button>
                    </form>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
