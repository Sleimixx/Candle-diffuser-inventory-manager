import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory & Sales Manager",
  description: "Inventory, production and sales management for any business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
