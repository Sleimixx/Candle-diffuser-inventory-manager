"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SaleData {
  id: string;
  recipeName: string;
  quantity: number;
  unitPrice: number;
  cogsPerUnit: number;
  soldAt: string;
}

export default function InvoiceButton({ sale, shopName }: { sale: SaleData; shopName: string }) {
  function generate() {
    const doc = new jsPDF();
    const revenue = sale.quantity * sale.unitPrice;
    const date = new Date(sale.soldAt);

    doc.setFontSize(20);
    doc.text(shopName, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("INVOICE", 14, 30);
    doc.text(`#${sale.id.slice(0, 8).toUpperCase()}`, 14, 35);
    doc.text(`Date: ${date.toLocaleDateString()}`, 14, 42);

    doc.setDrawColor(200);
    doc.line(14, 46, 196, 46);

    autoTable(doc, {
      startY: 52,
      head: [["Item", "Qty", "Unit Price", "Total"]],
      body: [[sale.recipeName, String(sale.quantity), `$${sale.unitPrice.toFixed(2)}`, `$${revenue.toFixed(2)}`]],
      theme: "grid",
      headStyles: { fillColor: [30, 30, 30] },
      styles: { fontSize: 10 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = ((doc as any).lastAutoTable?.finalY as number) ?? 80;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total: $${revenue.toFixed(2)}`, 196, finalY + 14, { align: "right" });

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Thank you for your purchase!", 14, finalY + 30);

    doc.save(`invoice-${sale.id.slice(0, 8)}.pdf`);
  }

  return (
    <button
      onClick={generate}
      title="Download invoice"
      className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    </button>
  );
}
