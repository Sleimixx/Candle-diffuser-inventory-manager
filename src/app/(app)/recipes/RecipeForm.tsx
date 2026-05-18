import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertRecipe } from "./actions";
import Link from "next/link";

type Existing = {
  id: string;
  name: string;
  salePrice: number;
  notes: string | null;
  items: { itemId: string; qty: number }[];
} | null;

export default async function RecipeForm({ existing }: { existing?: Existing }) {
  const user = await requireUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { items: { orderBy: { name: "asc" } } },
  });

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  if (totalItems === 0) {
    return (
      <p className="text-sm text-gray-600">
        Add at least one item in <Link href="/inventory" className="underline">Inventory</Link> first.
      </p>
    );
  }

  const qtyMap = new Map((existing?.items ?? []).map((x) => [x.itemId, x.qty]));

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
      </div>

      {categories.map((c) => (
        c.items.length === 0 ? null : (
          <fieldset key={c.id} className="border rounded p-3">
            <legend className="px-1 text-sm font-medium">{c.name} <span className="text-xs text-gray-500">({c.unit} per unit produced)</span></legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {c.items.map((it) => (
                <label key={it.id} className="text-sm flex items-center justify-between gap-2">
                  <span>{it.name}</span>
                  <input
                    name={`item_${it.id}`}
                    type="number" step="0.01" min="0"
                    defaultValue={qtyMap.get(it.id) ?? ""}
                    className="w-24 border rounded px-2 py-1"
                    placeholder={c.unit}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        )
      ))}

      <label className="text-sm block">
        Notes
        <textarea name="notes" defaultValue={existing?.notes ?? ""} rows={2} className="block w-full mt-1 border rounded px-2 py-1" />
      </label>

      <button className="px-4 py-2 rounded bg-black text-white text-sm">Save recipe</button>
    </form>
  );
}
