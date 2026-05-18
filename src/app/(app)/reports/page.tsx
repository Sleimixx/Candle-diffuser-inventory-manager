import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { money, num } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const from = sp.from ? new Date(sp.from) : new Date(Date.now() - 30 * 86400000);
  const to   = sp.to   ? new Date(sp.to)   : new Date();

  const [sales, runs] = await Promise.all([
    prisma.sale.findMany({
      where: { userId: user.id, soldAt: { gte: from, lte: to } },
    }),
    prisma.productionRun.findMany({
      where: { userId: user.id, producedAt: { gte: from, lte: to } },
    }),
  ]);

  const revenue = sales.reduce((s, x) => s + x.quantity * x.unitPrice, 0);
  const cogs    = sales.reduce((s, x) => s + x.quantity * x.cogsPerUnit, 0);
  const profit  = revenue - cogs;
  const margin  = revenue > 0 ? (profit / revenue) * 100 : 0;
  const produced = runs.reduce((s, r) => s + r.quantity, 0);
  const soldQty  = sales.reduce((s, x) => s + x.quantity, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <form className="rounded border bg-white p-3 flex flex-wrap gap-3 items-end">
        <label className="text-sm">From <input name="from" type="date" defaultValue={from.toISOString().slice(0, 10)} className="block border rounded px-2 py-1" /></label>
        <label className="text-sm">To   <input name="to"   type="date" defaultValue={to.toISOString().slice(0, 10)}   className="block border rounded px-2 py-1" /></label>
        <button className="px-3 py-1 rounded bg-black text-white text-sm">Filter</button>
      </form>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Produced" value={num(produced)} />
        <Stat label="Sold"     value={num(soldQty)} />
        <Stat label="Revenue"  value={money(revenue)} />
        <Stat label="Net"      value={`${money(profit)} (${num(margin, 1)}%)`} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-white p-3">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
