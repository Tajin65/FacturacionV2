import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Client, Contact, Employee, Product, Quote } from "../types/models";

type ExportQuotePdfParams = {
  quote: Quote;
  client?: Client;
  contact?: Contact;
  employee?: Employee;
  products: Product[];
  logoSrc?: string;
};

function formatCurrency(value: number, currency: "MXN" | "USD") {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function exportQuoteToPdf({
  quote,
  client,
  contact,
  employee,
  products,
  logoSrc,
}: ExportQuotePdfParams) {
  const doc = new jsPDF("p", "mm", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 16;

  if (logoSrc) {
    try {
      doc.addImage(logoSrc, "PNG", 14, 10, 38, 24);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("PUNTO CERO", 14, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("SOLUCIONES", 14, y);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("PUNTO CERO", 14, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("SOLUCIONES", 14, y);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("FECHA:", 145, 18);
  doc.setFont("helvetica", "normal");
  doc.text(quote.date || "-", 160, 18);

  doc.setFont("helvetica", "bold");
  doc.text("FOLIO:", 145, 24);
  doc.setFont("helvetica", "normal");
  doc.text(quote.folio || "-", 160, 24);

  const labelX = 14;
  const valueX = 55;
  const lineGap = 5.5;
  let infoY = 50;

  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE:", labelX, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(client?.businessName || "-", valueX, infoY);
  infoY += lineGap;

  doc.setFont("helvetica", "bold");
  doc.text("RAZÓN SOCIAL:", labelX, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(client?.legalName || "-", valueX, infoY);
  infoY += lineGap;

  doc.setFont("helvetica", "bold");
  doc.text("RFC:", labelX, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(client?.taxId || "-", valueX, infoY);
  infoY += lineGap;

  doc.setFont("helvetica", "bold");
  doc.text("CONTACTO:", labelX, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(contact?.fullName || "-", valueX, infoY);
  infoY += lineGap;

  doc.setFont("helvetica", "bold");
  doc.text("VENDEDOR:", labelX, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(employee?.fullName || "-", valueX, infoY);
  infoY += lineGap;

  doc.setFont("helvetica", "bold");
  doc.text("PUESTO:", labelX, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(employee?.position || "-", valueX, infoY);
  infoY += lineGap;

  doc.setFont("helvetica", "bold");
  doc.text("PROYECTO:", labelX, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(quote.projectName || "-", valueX, infoY);

  y = 94;

  doc.setDrawColor(80);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  const rows = quote.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const concept = item.isFreeItem
      ? item.freeItemName || "Producto libre"
      : product?.shortName || "Producto";

    const description = item.isFreeItem
      ? [concept, item.freeItemDescription].filter(Boolean).join(" - ")
      : [product?.partNumber, concept].filter(Boolean).join(" - ");

    const discount = item.perUnitDiscount || 0;
    const taxBase = item.lineSubtotal * ((quote.taxRatePercent || 0) / 100);

    return [
      String(item.quantity),
      description,
      formatNumber(item.unitPrice),
      formatNumber(discount),
      formatNumber(taxBase),
      formatNumber(item.lineSubtotal),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [[
      "CANTIDAD",
      "DESCRIPCIÓN",
      "PRECIO UNITARIO",
      "DESCUENTO",
      "IMPUESTOS",
      "MONTO",
    ]],
    body: rows,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [120, 120, 120],
      lineWidth: 0.2,
      textColor: [20, 20, 20],
    },
    headStyles: {
      fillColor: [15, 39, 71],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 20, halign: "center" },
      1: { cellWidth: 74 },
      2: { cellWidth: 28, halign: "right" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 24, halign: "right" },
      5: { cellWidth: 24, halign: "right" },
    },
  });

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || y + 10;

  let totalsY = finalY + 8;
  const labelTotals = 130;
  const valueTotals = 178;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");

  const subtotalBase =
    quote.subtotal + (quote.discountAmount || 0) - (quote.laborAmount || 0);

  doc.text("SUBTOTAL", labelTotals, totalsY);
  doc.text(formatCurrency(subtotalBase, quote.currency), valueTotals, totalsY, {
    align: "right",
  });
  totalsY += 6;

  doc.text(`IVA ${quote.taxRatePercent.toFixed(0)}%`, labelTotals, totalsY);
  doc.text(formatCurrency(quote.tax, quote.currency), valueTotals, totalsY, {
    align: "right",
  });
  totalsY += 6;

  doc.text("DESCUENTO", labelTotals, totalsY);
  doc.text(formatCurrency(quote.discountAmount || 0, quote.currency), valueTotals, totalsY, {
    align: "right",
  });
  totalsY += 6;

  if ((quote.laborAmount || 0) > 0) {
    doc.text("MANO DE OBRA", labelTotals, totalsY);
    doc.text(formatCurrency(quote.laborAmount || 0, quote.currency), valueTotals, totalsY, {
      align: "right",
    });
    totalsY += 6;
  }

  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", labelTotals, totalsY);
  doc.text(formatCurrency(quote.total, quote.currency), valueTotals, totalsY, {
    align: "right",
  });

  totalsY += 12;

  if (quote.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Notas:", 14, totalsY);
    totalsY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(quote.notes, 180);
    doc.text(splitNotes, 14, totalsY);
    totalsY += splitNotes.length * 4 + 10;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Atentamente,", 14, totalsY);
  totalsY += 16;

  if (employee?.signatureImage) {
    try {
      doc.addImage(employee.signatureImage, "PNG", 14, totalsY - 12, 40, 18);
    } catch {
      // no romper si falla la firma
    }
  }

  doc.setFont("helvetica", "bold");
  doc.text(employee?.fullName || "-", 14, totalsY + 10);

  doc.setFont("helvetica", "normal");
  doc.text(employee?.position || "-", 14, totalsY + 16);

  doc.save(`${quote.folio}.pdf`);
}
