"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",          label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/recipes",   label: "Recipes" },
  { href: "/produce",   label: "Produce" },
  { href: "/sales",     label: "Sales" },
  { href: "/reports",   label: "Reports" },
];

export default function NavSidebar({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 px-4 h-14">
        <span className="font-semibold text-base">Candle Shop</span>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-20 h-full w-56 bg-white border-r border-gray-200 p-4 flex flex-col
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:h-screen
        `}
      >
        <div className="text-lg font-semibold mb-6 hidden md:block">Candle Shop</div>
        <div className="h-14 md:hidden" />
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-md text-sm ${active ? "bg-gray-100 font-medium" : "hover:bg-gray-100"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="px-3 text-xs text-gray-500 truncate">Signed in as <span className="font-medium text-gray-700">{username}</span></div>
          <form action="/logout" method="post">
            <button className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100">Log out</button>
          </form>
        </div>
      </aside>
    </>
  );
}
