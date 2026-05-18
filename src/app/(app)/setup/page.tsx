import Link from "next/link";

const TABS = [
  { href: "/setup/sizes",      label: "Jar sizes",   desc: "Define the jar sizes you carry (Small, Medium, Large, etc.)." },
  { href: "/setup/colors",     label: "Colors",      desc: "Define each color and its scent line label." },
  { href: "/setup/wick-rules", label: "Wick rules",  desc: "Map each jar size to a wick type and quantity." },
];

export default function SetupHome() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Setup</h1>
      <p className="text-sm text-gray-600">
        Customize the product structure for your shop. Existing recipes, jars, and stickers reference these.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="block rounded border bg-white p-4 hover:bg-gray-50">
            <div className="font-medium text-sm">{t.label}</div>
            <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
