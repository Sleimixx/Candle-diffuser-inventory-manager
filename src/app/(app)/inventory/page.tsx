import Link from "next/link";

const TABS = [
  { href: "/inventory/wax",      label: "Wax" },
  { href: "/inventory/scents",   label: "Scents" },
  { href: "/inventory/wicks",    label: "Wicks" },
  { href: "/inventory/jars",     label: "Jars" },
  { href: "/inventory/stickers", label: "Stickers" },
];

export default function InventoryHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Inventory</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="px-3 py-2 rounded border bg-white hover:bg-gray-50 text-sm">
            {t.label}
          </Link>
        ))}
      </div>
      <p className="text-sm text-gray-600">Pick a category above to view and update stock.</p>
    </div>
  );
}
