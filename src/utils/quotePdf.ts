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
  logoSrc,
}: ExportQuotePdfParams) {
  const doc = new jsPDF("p", "mm", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 16;

  // Logo 10% más chico
  if (logoSrc) {
    try {
      doc.addImage(logoSrc, "PNG", 14, 10, 49.5, 30.6);
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

  // Fecha y folio al lado derecho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("FECHA:", 145, 18);
  doc.setFont("helvetica", "normal");
  doc.text(quote.date || "-", 160, 18);

  doc.setFont("helvetica", "bold");
  doc.text("FOLIO:", 145, 24);
  doc.setFont("helvetica", "normal");
  doc.text(quote.folio || "-", 160, 24);

  // Datos del cliente y comerciales del lado izquierdo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CLIENTE:", 14, 50);
  doc.setFont("helvetica", "normal");
  doc.text(client?.businessName || "-", 32, 50);

  doc.setFont("helvetica", "bold");
  doc.text("RAZÓN SOCIAL:", 14, 56);
  doc.setFont("helvetica", "normal");
  doc.text(client?.legalName || "-", 38, 56);

  doc.setFont("helvetica", "bold");
  doc.text("RFC:", 14, 62);
  doc.setFont("helvetica", "normal");
  doc.text(client?.taxId || "-", 23, 62);

  doc.setFont("helvetica", "bold");
  doc.text("CONTACTO:", 14, 68);
  doc.setFont("helvetica", "normal");
  doc.text(contact?.fullName || "-", 32, 68);

  doc.setFont("helvetica", "bold");
  doc.text("VENDEDOR:", 14, 74);
  doc.setFont("helvetica", "normal");
  doc.text(employee?.fullName || "-", 34, 74);

  doc.setFont("helvetica", "bold");
  doc.text("PUESTO:", 14, 80);
  doc.setFont("helvetica", "normal");
  doc.text(employee?.position || "-", 28, 80);

  doc.setFont("helvetica", "bold");
  doc.text("PROYECTO:", 14, 86);
  doc.setFont("helvetica", "normal");
  doc.text(quote.projectName || "-", 33, 86);

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
  const labelX = 130;
  const valueX = 178;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");

  const subtotalBase = quote.subtotal + (quote.discountAmount || 0) - (quote.laborAmount || 0);

  doc.text("SUBTOTAL", labelX, totalsY);
  doc.text(formatCurrency(subtotalBase, quote.currency), valueX, totalsY, {
    align: "right",
  });
  totalsY += 6;

  doc.text(`IVA ${quote.taxRatePercent.toFixed(0)}%`, labelX, totalsY);
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
      // sigue sin romper si la imagen no carga
    }
  }

  doc.setFont("helvetica", "bold");
  doc.text(employee?.fullName || "-", 14, totalsY + 10);

  doc.setFont("helvetica", "normal");
  doc.text(employee?.position || "-", 14, totalsY + 16);

  doc.save(`${quote.folio}.pdf`);
}
