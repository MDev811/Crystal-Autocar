"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { rupiah } from "@/lib/format";

type ExportPayload = {
  title: string;
  period: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
};

export function ExportButtons({ payload }: { payload: ExportPayload }) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  // Ekspor PDF (FR-18)
  const handlePdf = async () => {
    try {
      setLoadingPdf(true);
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "landscape" });

      // Header Showroom Crystal Autocar
      doc.setFontSize(16);
      doc.setTextColor(20, 30, 60);
      doc.text("SHOWROOM CRYSTAL AUTOCAR", 14, 15);

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(payload.title, 14, 22);

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Periode: ${payload.period} | Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

      autoTable(doc, {
        startY: 32,
        head: [payload.headers],
        body: payload.rows.map((row) =>
          row.map((cell) => (typeof cell === "number" ? rupiah(cell) : String(cell ?? "-")))
        ),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [14, 116, 144], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      doc.save(`${payload.filename}.pdf`);
    } catch (err) {
      alert("Gagal mengekspor PDF: " + (err as Error).message);
    } finally {
      setLoadingPdf(false);
    }
  };

  // Ekspor Excel (FR-18)
  const handleExcel = async () => {
    try {
      setLoadingExcel(true);
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan");

      // Title rows
      worksheet.addRow(["SHOWROOM CRYSTAL AUTOCAR"]);
      worksheet.addRow([payload.title]);
      worksheet.addRow([`Periode: ${payload.period} | Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`]);
      worksheet.addRow([]); // Blank row

      // Table Header
      const headerRow = worksheet.addRow(payload.headers);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0E7490" },
      };

      // Table Data
      payload.rows.forEach((r) => {
        worksheet.addRow(r);
      });

      // Auto-fit column width
      worksheet.columns.forEach((column) => {
        let maxLen = 12;
        column.eachCell?.({ includeEmpty: false }, (cell) => {
          const len = String(cell.value ?? "").length;
          if (len > maxLen) maxLen = len;
        });
        column.width = Math.min(maxLen + 4, 40);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${payload.filename}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal mengekspor Excel: " + (err as Error).message);
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePdf}
        disabled={loadingPdf}
        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 active:scale-95 transition"
      >
        {loadingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
        PDF
      </button>

      <button
        onClick={handleExcel}
        disabled={loadingExcel}
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition"
      >
        {loadingExcel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
        Excel (.xlsx)
      </button>
    </div>
  );
}
