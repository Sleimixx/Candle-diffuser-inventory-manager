import { prisma } from "@/lib/prisma";
import { updateJar } from "../actions";
import { ALL_COLORS, ALL_SIZES, COLOR_LINES, LOW_STOCK, SIZE_LABEL } from "@/lib/constants";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function JarsPage() {
  const jars = await prisma.jar.findMany();
  const byKey = new Map(jars.map((j) => [`${j.size}-${j.color}`, j]));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Jars</h1>
      <table className="w-full text-sm bg-white border rounded">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Color (Line)</th>
            {ALL_SIZES.map((s) => <th key={s} className="p-3">{SIZE_LABEL[s]}</th>)}
          </tr>
        </thead>
        <tbody>
          {ALL_COLORS.map((c) => (
            <tr key={c} className="border-b last:border-0">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLOR_LINES[c].hex }} />
                  <div>
                    <div>{COLOR_LINES[c].color}</div>
                    <div className="text-xs text-gray-500">{COLOR_LINES[c].line}</div>
                  </div>
                </div>
              </td>
              {ALL_SIZES.map((s) => {
                const j = byKey.get(`${s}-${c}`)!;
                const low = j.stockQty < LOW_STOCK.jarQty;
                return (
                  <td key={s} className="p-3 align-top">
                    <div className={`text-sm ${low ? "text-red-600 font-medium" : ""}`}>{j.stockQty} pcs</div>
                    <div className="text-xs text-gray-500 mb-1">{money(j.unitCost)} each</div>
                    <form action={updateJar} className="flex gap-1 items-center">
                      <input type="hidden" name="id" value={j.id} />
                      <input name="unitCost" type="number" step="0.01" defaultValue={j.unitCost} className="w-16 border rounded px-1 py-0.5 text-xs" />
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
  );
}
