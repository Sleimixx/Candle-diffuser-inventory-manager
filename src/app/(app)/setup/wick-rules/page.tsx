import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { upsertWickRule } from "../actions";

export const dynamic = "force-dynamic";

export default async function WickRulesPage() {
  const user = await requireUser();
  const [sizes, wicks, rules] = await Promise.all([
    prisma.jarSize.findMany({ where: { userId: user.id }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.wick.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.wickRule.findMany({ where: { userId: user.id } }),
  ]);
  const byKey = new Map(rules.map((r) => [r.sizeId, r]));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wick rules</h1>
      <p className="text-xs text-gray-500">
        Set the wick type and quantity used per candle for each jar size. Production is blocked for any size without a rule.
      </p>

      {wicks.length === 0 && (
        <p className="text-sm text-gray-600">
          Add at least one wick on the <Link href="/inventory/wicks" className="underline">Wicks</Link> page first.
        </p>
      )}

      <div className="overflow-x-auto">
      <table className="w-full text-sm bg-white border rounded min-w-[36rem]">
        <thead className="text-left text-gray-600 border-b">
          <tr><th className="p-3">Jar size</th><th className="p-3">Wick</th><th className="p-3">Qty per candle</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {sizes.length === 0 && <tr><td colSpan={4} className="p-3 text-gray-500">No jar sizes yet.</td></tr>}
          {sizes.map((s) => {
            const r = byKey.get(s.id);
            return (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3">{s.name}</td>
                <td className="p-3" colSpan={2}>
                  <form action={upsertWickRule} className="flex gap-2 items-center">
                    <input type="hidden" name="sizeId" value={s.id} />
                    <select name="wickId" defaultValue={r?.wickId ?? ""} className="border rounded px-2 py-1">
                      <option value="">— none —</option>
                      {wicks.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    <input name="qty" type="number" min="0" step="1" defaultValue={r?.qty ?? 1} className="w-20 border rounded px-2 py-1" />
                    <button className="px-3 py-1 rounded bg-black text-white text-xs">Save</button>
                  </form>
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {r ? "Active" : <span className="text-red-600">No rule</span>}
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
