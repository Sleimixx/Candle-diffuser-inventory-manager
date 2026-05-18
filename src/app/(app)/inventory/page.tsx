import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function InventoryHome() {
  const user = await requireUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inventory</h1>

      <div className="rounded border bg-white p-4">
        <div className="text-sm font-medium mb-2">Add category</div>
        <form action={createCategory} className="flex flex-wrap gap-2 items-center">
          <input name="name" required placeholder="Name (e.g. Wax, Paint, Fabric)" className="border rounded px-2 py-1" />
          <input name="unit" placeholder="Unit (g, ml, pcs, …)" defaultValue="pcs" className="w-40 border rounded px-2 py-1" />
          <button className="px-3 py-1 rounded bg-black text-white">Add</button>
        </form>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-600">No categories yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/inventory/${c.id}`} className="block rounded border bg-white p-4 hover:bg-gray-50">
              <div className="font-medium text-sm">{c.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {c._count.items} item{c._count.items === 1 ? "" : "s"} · unit: {c.unit}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
