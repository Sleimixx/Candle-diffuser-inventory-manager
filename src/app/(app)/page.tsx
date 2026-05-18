import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK } from "@/lib/constants";
import { money, num } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUser();
  const [waxes, jars, stickers, wicks, wickSticker, sales] = await Promise.all([
    prisma.waxType.findMany({ where: { userId: user.id } }),
    prisma.jar.findMany({ where: { userId: user.id }, include: { size: true, color: true } }),
    prisma.sticker.findMany({ where: { userId: user.id }, include: { size: true, color: true } }),
    prisma.wick.findMany({ where: { userId: user.id } }),
    prisma.wickSticker.findUnique({ where: { userId: user.id } }),
    prisma.sale.findMany({ where: { userId: user.id } }),
  ]);

  const revenue = sales.reduce((s, x) => s + x.quantity * x.unitPrice, 0);
  const cogs    = sales.reduce((s, x) => s + x.quantity * x.cogsPerUnit, 0);
  const profit  = revenue - cogs;
  const margin  = revenue > 0 ? (profit / revenue) * 100 : 0;

  const lowWax    = waxes.filter((w) => w.stockGrams < LOW_STOCK.waxGrams);
  const lowJars   = jars.filter((j) => j.stockQty < LOW_STOCK.jarQty);
  const lowStk    = stickers.filter((s) => s.stockQty < LOW_STOCK.stickerQty);
  const lowWicks  = wicks.filter((w) => w.stockQty < LOW_STOCK.wickQty);
  const lowWS     = wickSticker && wickSticker.stockQty < LOW_STOCK.wickStickerQty ? [wickSticker] : [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Revenue"    value={money(revenue)} />
        <Stat label="COGS"       value={money(cogs)} />
        <Stat label="Net income" value={money(profit)} />
        <Stat label="Margin"     value={`${num(margin, 1)}%`} />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Low stock</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title="Waxes below 10 kg">
            {lowWax.length === 0 ? <Empty /> :
              <ul className="text-sm space-y-1">
                {lowWax.map((w) => (
                  <li key={w.id} className="flex justify-between">
                    <span>{w.name}</span>
                    <span className="text-red-600">{num(w.stockGrams)} g</span>
                  </li>
                ))}
              </ul>}
          </Card>
          <Card title="Wicks / wick stickers below 20">
            {lowWicks.length === 0 && lowWS.length === 0 ? <Empty /> :
              <ul className="text-sm space-y-1">
                {lowWicks.map((w) => (
                  <li key={w.id} className="flex justify-between">
                    <span>{w.name}</span>
                    <span className="text-red-600">{w.stockQty} pcs</span>
                  </li>
                ))}
                {lowWS.map((w) => (
                  <li key={w.id} className="flex justify-between">
                    <span>Wick sticker</span>
                    <span className="text-red-600">{w.stockQty} pcs</span>
                  </li>
                ))}
              </ul>}
          </Card>
          <Card title="Jars below 20">
            {lowJars.length === 0 ? <Empty /> :
              <ul className="text-sm space-y-1">
                {lowJars.map((j) => (
                  <li key={j.id} className="flex justify-between">
                    <span>{j.size.name} {j.color.name}{j.color.scentLine ? ` — ${j.color.scentLine}` : ""}</span>
                    <span className="text-red-600">{j.stockQty} pcs</span>
                  </li>
                ))}
              </ul>}
          </Card>
          <Card title="Stickers below 20">
            {lowStk.length === 0 ? <Empty /> :
              <ul className="text-sm space-y-1">
                {lowStk.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span>{s.size.name} {s.color.name}{s.color.scentLine ? ` — ${s.color.scentLine}` : ""}</span>
                    <span className="text-red-600">{s.stockQty} pcs</span>
                  </li>
                ))}
              </ul>}
          </Card>
        </div>
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-sm font-medium mb-2">{title}</div>
      {children}
    </div>
  );
}

function Empty() {
  return <div className="text-sm text-gray-500">All good.</div>;
}
