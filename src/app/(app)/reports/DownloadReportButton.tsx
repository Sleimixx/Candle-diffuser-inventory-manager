"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  from: string;
  to: string;
  produced: number;
  sold: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
  shopName: string;
}

export default function DownloadReportButton({ data }: { data: ReportData }) {
  function generate() {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(data.shopName, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("SALES REPORT", 14, 30);
    doc.text(`${data.from}  to  ${data.to}`, 14, 36);

    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    autoTable(doc, {
      startY: 46,
      head: [["Metric", "Value"]],
      body: [
        ["Units Produced", String(data.produced)],
        ["Units Sold", String(data.sold)],
        ["Revenue", `$${data.revenue.toFixed(2)}`],
        ["COGS", `$${data.cogs.toFixed(2)}`],
        ["Net Profit", `$${data.profit.toFixed(2)}`],
        ["Margin", `${data.margin.toFixed(1)}%`],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 30, 30] },
      styles: { fontSize: 11 },
      columnStyles: { 0: { fontStyle: "bold" } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = ((doc as any).lastAutoTable?.finalY as number) ?? 120;

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, finalY + 12);

    doc.save(`report-${data.from}-to-${data.to}.pdf`);
  }

  return (
    <button
      onClick={generate}
      className="px-3 py-1 rounded bg-gray-800 text-white text-sm hover:bg-gray-700"
    >
      Download PDF
    </button>
  );
}
