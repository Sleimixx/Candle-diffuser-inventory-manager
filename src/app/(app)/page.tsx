import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { money, num } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUser();
  const sales = await prisma.sale.findMany({ where: { userId: user.id } });

  const revenue = sales.reduce((s, x) => s + x.quantity * x.unitPrice, 0);
  const cogs    = sales.reduce((s, x) => s + x.quantity * x.cogsPerUnit, 0);
  const profit  = revenue - cogs;
  const margin  = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Revenue"    value={money(revenue)} />
        <Stat label="COGS"       value={money(cogs)} />
        <Stat label="Net income" value={money(profit)} />
        <Stat label="Margin"     value={`${num(margin, 1)}%`} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}
