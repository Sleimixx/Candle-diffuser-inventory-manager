import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createColor, updateColor, deleteColor } from "../actions";

export const dynamic = "force-dynamic";

export default async function ColorsPage() {
  const user = await requireUser();
  const colors = await prisma.jarColor.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Colors</h1>
      <p className="text-xs text-gray-500">
        Each color may have a “scent line” label that gets shown next to the color name throughout the app.
      </p>

      <div className="rounded border bg-white p-4">
        <div className="text-sm font-medium mb-2">Add color</div>
        <form action={createColor} className="flex flex-wrap gap-2 items-center">
          <input name="name"      required placeholder="Name (e.g. Purple)" className="border rounded px-2 py-1" />
          <input name="hex"       type="color" defaultValue="#888888" className="h-8 w-12 border rounded" />
          <input name="scentLine" placeholder="Scent line (optional)" className="border rounded px-2 py-1" />
          <button className="px-3 py-1 rounded bg-black text-white text-sm">Add</button>
        </form>
      </div>

      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[36rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr><th className="p-3">Color</th><th className="p-3">Edit</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {colors.length === 0 && <tr><td colSpan={3} className="p-3 text-gray-500">No colors yet.</td></tr>}
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
              <td className="p-3">
                <form action={updateColor} className="flex flex-wrap gap-2 items-center">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="name"      defaultValue={c.name}             className="w-32 border rounded px-2 py-1" />
                  <input name="hex"       type="color" defaultValue={c.hex} className="h-8 w-12 border rounded" />
                  <input name="scentLine" defaultValue={c.scentLine ?? ""}  placeholder="Scent line" className="w-44 border rounded px-2 py-1" />
                  <button className="px-3 py-1 rounded bg-black text-white text-xs">Save</button>
                </form>
              </td>
              <td className="p-3">
                <form action={deleteColor}>
                  <input type="hidden" name="id" value={c.id} />
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
