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

export function exportQuoteToPdf({
  quote,
  client,
  contact,
  employee,
  products,
}: ExportQuotePdfParams) {
  const doc = new jsPDF();

  let y = 15;

  doc.setFontSize(18);
  doc.text("Cotización", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.text(`Folio: ${quote.folio}`, 14, y);
  doc.text(`Fecha: ${quote.date}`, 120, y);
  y += 6;

  doc.text(`Estatus: ${quote.status}`, 14, y);
  doc.text(`Moneda: ${quote.currency}`, 120, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Datos del cliente", 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Cliente: ${client?.businessName || "-"}`, 14, y);
  y += 5;
  doc.text(`Razón social: ${client?.legalName || "-"}`, 14, y);
  y += 5;
  doc.text(`RFC: ${client?.taxId || "-"}`, 14, y);
  y += 5;
  doc.text(`Email: ${client?.email || "-"}`, 14, y);
  y += 5;
  doc.text(`Teléfono: ${client?.phone || "-"}`, 14, y);
  y += 5;
  doc.text(
    `Dirección: ${client?.address || "-"}, ${client?.city || "-"}, ${client?.state || "-"}, ${client?.country || "-"}`,
    14,
    y
  );
  y += 8;

  doc.setFontSize(12);
  doc.text("Datos comerciales", 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Contacto: ${contact?.fullName || "-"}`, 14, y);
  y += 5;
  doc.text(`Vendedor: ${employee?.fullName || "-"}`, 14, y);
  y += 5;
  doc.text(`Proyecto: ${quote.projectName || "-"}`, 14, y);
  y += 8;

  const rows = quote.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const concept = item.isFreeItem
      ? item.freeItemName || "Producto libre"
      : product?.shortName || "Producto";

    const partNumber = item.isFreeItem ? "-" : product?.partNumber || "-";
    const unitDiscount = item.perUnitDiscount || 0;

    return [
      partNumber,
      concept,
      String(item.quantity),
      quote.currency,
      item.unitPrice.toFixed(2),
      unitDiscount.toFixed(2),
      item.lineSubtotal.toFixed(2),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["No. parte", "Concepto", "Cant.", "Moneda", "P. unitario", "Desc. pza", "Subtotal"]],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 39, 71] },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || y + 10;
  let totalsY = finalY + 10;

  doc.setFontSize(10);
  doc.text(`Subtotal: ${quote.subtotal.toFixed(2)} ${quote.currency}`, 140, totalsY);
  totalsY += 6;
  doc.text(`IVA: ${quote.tax.toFixed(2)} ${quote.currency}`, 140, totalsY);
  totalsY += 6;
  doc.text(`Total: ${quote.total.toFixed(2)} ${quote.currency}`, 140, totalsY);
  totalsY += 10;

  if (quote.notes) {
    doc.setFontSize(12);
    doc.text("Notas", 14, totalsY);
    totalsY += 6;
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(quote.notes, 180);
    doc.text(splitNotes, 14, totalsY);
    totalsY += splitNotes.length * 5 + 8;
  }

  doc.setFontSize(12);
  doc.text("Atentamente", 14, totalsY);
  totalsY += 16;

  if (employee?.signatureImage) {
    try {
      doc.addImage(employee.signatureImage, "PNG", 14, totalsY - 12, 40, 18);
    } catch {
      // Si la imagen no se puede insertar, continúa sin romper
    }
  }

  doc.setFontSize(10);
  doc.text(employee?.fullName || "-", 14, totalsY + 10);
  doc.text(employee?.position || "-", 14, totalsY + 16);

  doc.save(`${quote.folio}.pdf`);
}
