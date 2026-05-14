import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Candle Shop Inventory",
  description: "Inventory, production and sales for the candle shop.",
};

const NAV = [
  { href: "/",           label: "Dashboard" },
  { href: "/inventory",  label: "Inventory" },
  { href: "/recipes",    label: "Recipes" },
  { href: "/produce",    label: "Produce" },
  { href: "/sales",      label: "Sales" },
  { href: "/reports",    label: "Reports" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex">
          <aside className="w-56 border-r border-gray-200 bg-white p-4 flex flex-col">
            <div className="text-lg font-semibold mb-6">Candle Shop</div>
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-2 rounded-md text-sm hover:bg-gray-100"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1 p-8 max-w-6xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
