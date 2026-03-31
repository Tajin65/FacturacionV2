import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Client, Contact, Employee, Product, Quote } from "../types/models";

type ExportQuotePdfParams = {
  quote: Quote;
  client?: Client;
  contact?: Contact;
  employee?: Employee;
  products: Product[];
};

function formatCurrency(value: number, currency: "MXN" | "USD") {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatNumber(value: number, currency: "MXN" | "USD") {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", {
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
}: ExportQuotePdfParams) {
  const doc = new jsPDF("p", "mm", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 16;

  // Encabezado principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("PUNTO CERO", 14, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("SOLUCIONES", 14, y);
  y += 8;

  // Caja de datos del cliente / folio / fecha a la derecha
  const rightX = 120;
  let rightY = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CLIENTE:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(client?.businessName || "-", rightX + 22, rightY);
  rightY += 5;

  doc.setFont("helvetica", "bold");
  doc.text("RAZÓN SOCIAL:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(client?.legalName || "-", rightX + 32, rightY);
  rightY += 5;

  doc.setFont("helvetica", "bold");
  doc.text("RFC:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(client?.taxId || "-", rightX + 12, rightY);
  rightY += 5;

  doc.setFont("helvetica", "bold");
  doc.text("FECHA:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(quote.date || "-", rightX + 16, rightY);
  rightY += 5;

  doc.setFont("helvetica", "bold");
  doc.text("FOLIO:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(quote.folio || "-", rightX + 16, rightY);
  rightY += 5;

  doc.setFont("helvetica", "bold");
  doc.text("CONTACTO:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(contact?.fullName || "-", rightX + 24, rightY);
  rightY += 5;

  doc.setFont("helvetica", "bold");
  doc.text("VENDEDOR:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(employee?.fullName || "-", rightX + 24, rightY);
  rightY += 5;

  doc.setFont("helvetica", "bold");
  doc.text("PROYECTO:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(quote.projectName || "-", rightX + 22, rightY);

  y = Math.max(y, rightY + 8);

  // Línea separadora
  doc.setDrawColor(80);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Tabla principal
  const rows = quote.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const concept = item.isFreeItem
      ? item.freeItemName || "Producto libre"
      : product?.shortName || "Producto";

    const description = item.isFreeItem
      ? [concept, item.freeItemDescription].filter(Boolean).join(" - ")
      : [product?.partNumber, concept].filter(Boolean).join(" - ");

    const unitDiscount = item.perUnitDiscount || 0;
    const taxBase = item.lineSubtotal * ((quote.taxRatePercent || 0) / 100);

    return [
      String(item.quantity),
      description,
      formatNumber(item.unitPrice, quote.currency),
      formatNumber(unitDiscount, quote.currency),
      formatNumber(taxBase, quote.currency),
      formatNumber(item.lineSubtotal, quote.currency),
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
      fontSize: 8.5,
      cellPadding: 2,
      lineColor: [120, 120, 120],
      lineWidth: 0.2,
      textColor: [20, 20, 20],
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [40, 40, 40],
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
  const labelX = 130;
  const valueX = 178;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.text("SUBTOTAL", labelX, totalsY);
  doc.text(formatCurrency(quote.subtotal + (quote.discountAmount || 0) - (quote.laborAmount || 0), quote.currency), valueX, totalsY, {
    align: "right",
  });
  totalsY += 6;

  doc.text("TASA DE IMPUESTOS", labelX, totalsY);
  doc.text(`${quote.taxRatePercent.toFixed(2)}%`, valueX, totalsY, {
    align: "right",
  });
  totalsY += 6;

  doc.text("IMPUESTO A LAS VENTAS", labelX, totalsY);
  doc.text(formatCurrency(quote.tax, quote.currency), valueX, totalsY, {
    align: "right",
  });
  totalsY += 6;

  doc.text("DESCUENTO", labelX, totalsY);
  doc.text(formatCurrency(quote.discountAmount || 0, quote.currency), valueX, totalsY, {
    align: "right",
  });
  totalsY += 6;

  if ((quote.laborAmount || 0) > 0) {
    doc.text("MANO DE OBRA", labelX, totalsY);
    doc.text(formatCurrency(quote.laborAmount || 0, quote.currency), valueX, totalsY, {
      align: "right",
    });
    totalsY += 6;
  }

  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", labelX, totalsY);
  doc.text(formatCurrency(quote.total, quote.currency), valueX, totalsY, {
    align: "right",
  });

  totalsY += 12;

  if (quote.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Notas:", 14, totalsY);
    totalsY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(quote.notes, 180);
    doc.text(splitNotes, 14, totalsY);
    totalsY += splitNotes.length * 4 + 10;
  }

  // Firma
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Atentamente,", 14, totalsY);
  totalsY += 16;

  if (employee?.signatureImage) {
    try {
      doc.addImage(employee.signatureImage, "PNG", 14, totalsY - 12, 40, 18);
    } catch {
      // sigue sin romper si la imagen no carga
    }
  }

  doc.setFont("helvetica", "bold");
  doc.text(employee?.fullName || "-", 14, totalsY + 10);

  doc.setFont("helvetica", "normal");
  doc.text(employee?.position || "-", 14, totalsY + 16);

  doc.save(`${quote.folio}.pdf`);
}
