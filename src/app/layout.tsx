import "./globals.css";
import type { Metadata } from "next";
import NavSidebar from "./NavSidebar";

export const metadata: Metadata = {
  title: "Candle Shop Inventory",
  description: "Inventory, production and sales for the candle shop.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen md:flex">
          <NavSidebar />
          {/* Push content below mobile top bar */}
          <main className="flex-1 p-4 md:p-8 pt-18 md:pt-8 max-w-6xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
