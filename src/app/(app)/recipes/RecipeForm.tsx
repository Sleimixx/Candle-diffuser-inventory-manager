import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertRecipe } from "./actions";
import Link from "next/link";

type Existing = {
  id: string;
  name: string;
  jarId: string;
  stickerId: string;
  salePrice: number;
  notes: string | null;
  waxes: { waxId: string; grams: number }[];
  scents: { scentId: string; ml: number }[];
} | null;

export default async function RecipeForm({ existing }: { existing?: Existing }) {
  const user = await requireUser();
  const [waxes, scents, jars, stickers] = await Promise.all([
    prisma.waxType.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.scent.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.jar.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.sticker.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);

  if (jars.length === 0 || stickers.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Add at least one jar on <Link href="/inventory/jars" className="underline">Inventory → Jars</Link> and one sticker on <Link href="/inventory/stickers" className="underline">Inventory → Stickers</Link> first.
      </p>
    );
  }

  const waxMap = new Map((existing?.waxes ?? []).map((w) => [w.waxId, w.grams]));
  const scentMap = new Map((existing?.scents ?? []).map((s) => [s.scentId, s.ml]));

  return (
    <form action={upsertRecipe} className="space-y-6 max-w-2xl">
      {existing?.id && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm">
          Name
          <input name="name" required defaultValue={existing?.name ?? ""} className="block w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="text-sm">
          Sale price
          <input name="salePrice" type="number" step="0.01" defaultValue={existing?.salePrice ?? 0} className="block w-full mt-1 border rounded px-2 py-1" />
        </label>
        <label className="text-sm">
          Jar
          <select name="jarId" defaultValue={existing?.jarId ?? jars[0].id} className="block w-full mt-1 border rounded px-2 py-1">
            {jars.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Sticker
          <select name="stickerId" defaultValue={existing?.stickerId ?? stickers[0].id} className="block w-full mt-1 border rounded px-2 py-1">
            {stickers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>

      <fieldset className="border rounded p-3">
        <legend className="px-1 text-sm font-medium">Wax (grams per candle)</legend>
        {waxes.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">No wax types yet. Add some on the Wax inventory page.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {waxes.map((w) => (
              <label key={w.id} className="text-sm flex items-center justify-between gap-2">
                <span>{w.name}{w.isOptional && <span className="text-xs text-gray-500"> (optional)</span>}</span>
                <input
                  name={`wax_${w.id}`}
                  type="number" step="0.1" min="0"
                  defaultValue={waxMap.get(w.id) ?? ""}
                  className="w-24 border rounded px-2 py-1"
                  placeholder="g"
                />
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="border rounded p-3">
        <legend className="px-1 text-sm font-medium">Scents (ml per candle — blend)</legend>
        {scents.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">No scents yet. Add some on the Scents inventory page.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {scents.map((s) => (
              <label key={s.id} className="text-sm flex items-center justify-between gap-2">
                <span>{s.name}</span>
                <input
                  name={`scent_${s.id}`}
                  type="number" step="0.1" min="0"
                  defaultValue={scentMap.get(s.id) ?? ""}
                  className="w-24 border rounded px-2 py-1"
                  placeholder="ml"
                />
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <label className="text-sm block">
        Notes
        <textarea name="notes" defaultValue={existing?.notes ?? ""} rows={2} className="block w-full mt-1 border rounded px-2 py-1" />
      </label>

      <button className="px-4 py-2 rounded bg-black text-white text-sm">Save recipe</button>
    </form>
  );
}
