import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSize, updateSize, deleteSize } from "../actions";

export const dynamic = "force-dynamic";

export default async function SizesPage() {
  const user = await requireUser();
  const sizes = await prisma.jarSize.findMany({
    where: { userId: user.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Jar sizes</h1>

      <div className="rounded border bg-white p-4">
        <div className="text-sm font-medium mb-2">Add size</div>
        <form action={createSize} className="flex flex-wrap gap-2 items-center">
          <input name="name"      required placeholder="Name (e.g. Small)" className="border rounded px-2 py-1" />
          <input name="sortOrder" type="number" step="1" placeholder="Sort #" className="w-20 border rounded px-2 py-1" />
          <button className="px-3 py-1 rounded bg-black text-white text-sm">Add</button>
        </form>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[32rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr><th className="p-3">Name</th><th className="p-3">Sort</th><th className="p-3"></th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {sizes.length === 0 && <tr><td colSpan={4} className="p-3 text-gray-500">No sizes yet.</td></tr>}
          {sizes.map((s) => (
            <tr key={s.id} className="border-b last:border-0">
              <td className="p-3" colSpan={2}>
                <form action={updateSize} className="flex gap-2 items-center">
                  <input type="hidden" name="id" value={s.id} />
                  <input name="name"      defaultValue={s.name}      className="border rounded px-2 py-1" />
                  <input name="sortOrder" type="number" step="1" defaultValue={s.sortOrder} className="w-20 border rounded px-2 py-1" />
                  <button className="px-3 py-1 rounded bg-black text-white text-xs">Save</button>
                </form>
              </td>
              <td className="p-3"></td>
              <td className="p-3">
                <form action={deleteSize}>
                  <input type="hidden" name="id" value={s.id} />
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
