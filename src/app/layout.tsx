import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candle Shop Inventory",
  description: "Inventory, production and sales for the candle shop.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
