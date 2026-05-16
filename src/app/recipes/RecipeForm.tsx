import { prisma } from "@/lib/prisma";
import { upsertRecipe } from "./actions";
import { ALL_COLORS, ALL_SIZES, COLOR_LINES, SIZE_LABEL } from "@/lib/constants";

type Existing = {
  id: string;
  name: string;
  jarSize: string;
  color: string;
  salePrice: number;
  notes: string | null;
  waxes: { waxId: string; grams: number }[];
  scents: { scentId: string; ml: number }[];
} | null;

export default async function RecipeForm({ existing }: { existing?: Existing }) {
  const [waxes, scents] = await Promise.all([
    prisma.waxType.findMany({ orderBy: { name: "asc" } }),
    prisma.scent.findMany({ orderBy: { name: "asc" } }),
  ]);

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
          Jar size
          <select name="jarSize" defaultValue={existing?.jarSize ?? "MEDIUM"} className="block w-full mt-1 border rounded px-2 py-1">
            {ALL_SIZES.map((s) => <option key={s} value={s}>{SIZE_LABEL[s]}</option>)}
          </select>
        </label>
        <label className="text-sm">
          Color / line
          <select name="color" defaultValue={existing?.color ?? "PURPLE"} className="block w-full mt-1 border rounded px-2 py-1">
            {ALL_COLORS.map((c) => (
              <option key={c} value={c}>
                {COLOR_LINES[c].color} — {COLOR_LINES[c].line}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="border rounded p-3">
        <legend className="px-1 text-sm font-medium">Wax (grams per candle)</legend>
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
      <p className="text-xs text-gray-500">
        Wick &amp; wick sticker quantities are decided automatically from jar size on production.
      </p>
    </form>
  );
}
