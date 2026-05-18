import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createItem, updateItem, deleteItem, updateCategory, deleteCategory } from "../actions";
import { money, num } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const user = await requireUser();
  const { categoryId } = await params;
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id },
    include: { items: { orderBy: { name: "asc" } } },
  });
  if (!category) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs text-gray-500"><Link href="/inventory" className="underline">Inventory</Link></div>
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <div className="text-xs text-gray-500">unit: {category.unit}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={updateCategory} className="flex gap-2 items-center">
            <input type="hidden" name="id" value={category.id} />
            <input name="name" defaultValue={category.name} className="border rounded px-2 py-1 text-sm" />
            <input name="unit" defaultValue={category.unit} className="w-24 border rounded px-2 py-1 text-sm" />
            <button className="px-3 py-1 rounded bg-black text-white text-sm">Rename</button>
          </form>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={category.id} />
            <button className="text-red-600 text-sm">Delete category</button>
          </form>
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <div className="text-sm font-medium mb-2">Add item</div>
        <form action={createItem} className="flex flex-wrap gap-2 items-center">
          <input type="hidden" name="categoryId" value={category.id} />
          <input name="name"     required placeholder="Name" className="border rounded px-2 py-1" />
          <input name="unitCost" type="number" step="0.01" placeholder="$/unit" className="w-24 border rounded px-2 py-1" />
          <input name="stock"    type="number" step="0.01" placeholder={`Starting ${category.unit}`} className="w-36 border rounded px-2 py-1" />
          <button className="px-3 py-1 rounded bg-black text-white">Add</button>
        </form>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[32rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Item</th>
            <th className="p-3">Stock</th>
            <th className="p-3">$/unit</th>
            <th className="p-3">Cost-set / Restock</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {category.items.length === 0 && (
            <tr><td colSpan={5} className="p-3 text-gray-500">No items yet. Add one above.</td></tr>
          )}
          {category.items.map((it) => (
            <tr key={it.id} className="border-b last:border-0">
              <td className="p-3">{it.name}</td>
              <td className="p-3">{num(it.stock)} {category.unit}</td>
              <td className="p-3">{money(it.unitCost)}</td>
              <td className="p-3">
                <form action={updateItem} className="flex gap-2 items-center">
                  <input type="hidden" name="id" value={it.id} />
                  <input name="unitCost" type="number" step="0.01" defaultValue={it.unitCost} className="w-24 border rounded px-2 py-1" />
                  <input name="addStock" type="number" step="0.01" placeholder={`+ ${category.unit}`} className="w-28 border rounded px-2 py-1" />
                  <button className="px-3 py-1 rounded bg-black text-white">Save</button>
                </form>
              </td>
              <td className="p-3">
                <form action={deleteItem}>
                  <input type="hidden" name="id" value={it.id} />
                  <button className="text-red-600 text-xs">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
