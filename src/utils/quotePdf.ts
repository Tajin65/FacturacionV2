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

function safeText(value?: string) {
  return value?.trim() || "-";
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
  const pageHeight = doc.internal.pageSize.getHeight();

  const drawHeader = (isFirstPage: boolean) => {
    if (isFirstPage && logoSrc) {
      try {
        doc.addImage(logoSrc, "PNG", 10, 8, 36, 22);
      } catch {
        // seguir sin romper
      }
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Muchas gracias por su interés en nuestros productos, de acuerdo con su solicitud, abajo encontrará la cotización correspondiente,",
      14,
      35
    );
    doc.text("cualquier duda, estamos a sus órdenes.", 14, 39);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    doc.text("Cliente:", 14, 49);
    doc.setFont("helvetica", "normal");
    doc.text(safeText(client?.businessName), 34, 49);

    doc.setFont("helvetica", "bold");
    doc.text("Dirección:", 14, 55);
    doc.setFont("helvetica", "normal");
    const fullAddress = [
      client?.address,
      client?.city,
      client?.state,
      client?.country,
    ]
      .filter(Boolean)
      .join(", ");
    doc.text(safeText(fullAddress), 34, 55);

    doc.setFont("helvetica", "bold");
    doc.text("Atención:", 14, 61);
    doc.setFont("helvetica", "normal");
    doc.text(safeText(contact?.fullName), 34, 61);

    doc.setFont("helvetica", "bold");
    doc.text("Referencia:", 14, 67);
    doc.setFont("helvetica", "normal");
    doc.text(safeText(quote.projectName), 34, 67);

    doc.setFont("helvetica", "bold");
    doc.text("No. Cliente:", 14, 73);
    doc.setFont("helvetica", "normal");
    doc.text(safeText(client?.id?.slice(0, 4)), 34, 73);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("COTIZACIÓN #", 145, 49);

    doc.setFont("helvetica", "normal");
    doc.text(safeText(quote.folio), 145, 55);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Fecha:", 145, 63);
    doc.setFont("helvetica", "normal");
    doc.text(safeText(quote.date), 158, 63);

    doc.setDrawColor(120);
    doc.line(14, 80, pageWidth - 14, 80);
  };

  const drawFooter = (pageNumber: number, totalPages?: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      "PUNTO CERO SOLUCIONES | PASEO DEL CONDADO 7, CORREGIDORA, QRO. | TEL: +524421713108",
      14,
      pageHeight - 8
    );
    const pageText = totalPages
      ? `Página ${pageNumber} de ${totalPages}`
      : `Página ${pageNumber}`;
    doc.text(pageText, pageWidth - 14, pageHeight - 8, { align: "right" });
  };

  drawHeader(true);

  const bodyRows = quote.items.map((item, index) => {
    const product = products.find((p) => p.id === item.productId);

    const catalog = item.isFreeItem ? "-" : product?.partNumber || "-";
    const concept = item.isFreeItem
      ? item.freeItemName || "Producto libre"
      : product?.shortName || "Producto";

    const description = item.isFreeItem
      ? [concept, item.freeItemDescription].filter(Boolean).join(" - ")
      : [concept, product?.model ? `MODELO ${product.model}` : ""]
          .filter(Boolean)
          .join(" / ");

    return [
      String(index + 1),
      catalog,
      String(item.quantity),
      formatCurrency(item.unitPrice, quote.currency),
      formatCurrency(item.lineSubtotal, quote.currency),
      description,
      quote.currency,
    ];
  });

  autoTable(doc, {
    startY: 84,
    head: [[
      "PART.",
      "CATALOGO",
      "CANT.",
      "PRECIO UNIT.",
      "TOTAL DE LINEA",
      "DESCRIPCIÓN",
      "MONEDA",
    ]],
    body: bodyRows,
    theme: "grid",
    margin: { left: 14, right: 14, top: 84, bottom: 22 },
    styles: {
      fontSize: 7.4,
      cellPadding: 1.6,
      lineColor: [120, 120, 120],
      lineWidth: 0.2,
      textColor: [20, 20, 20],
      valign: "top",
    },
    headStyles: {
      fillColor: [15, 39, 71],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 24, halign: "left" },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 75, halign: "left" },
      6: { cellWidth: 18, halign: "center" },
    },
      didDrawPage: (data) => {
        drawHeader(data.pageNumber === 1);
        drawFooter(data.pageNumber);
      },
  });

  let currentY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 180;

  if (currentY > 205) {
    doc.addPage();
    drawFooter(doc.getNumberOfPages());
    currentY = 20;
  }

  let totalsY = currentY + 8;
  const labelX = 132;
  const valueX = 195;

  const subtotalBase =
    quote.subtotal + (quote.discountAmount || 0) - (quote.laborAmount || 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  doc.text("SUBTOTAL", labelX, totalsY);
  doc.text(formatCurrency(subtotalBase, quote.currency), valueX, totalsY, {
    align: "right",
  });
  totalsY += 6;

  doc.text("IVA %", labelX, totalsY);
  doc.text(`${quote.taxRatePercent.toFixed(2)}%`, valueX, totalsY, {
    align: "right",
  });
  totalsY += 6;

  doc.text("IMPUESTO", labelX, totalsY);
  doc.text(formatCurrency(quote.tax, quote.currency), valueX, totalsY, {
    align: "right",
  });
  totalsY += 6;

  if ((quote.discountAmount || 0) > 0) {
    doc.text("DESCUENTO", labelX, totalsY);
    doc.text(formatCurrency(quote.discountAmount || 0, quote.currency), valueX, totalsY, {
      align: "right",
    });
    totalsY += 6;
  }

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

  let notesY = totalsY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(
    "PRECIOS SUJETOS A CAMBIO SIN PREVIO AVISO. VIGENCIA DE LA COTIZACIÓN 15 DÍAS.",
    14,
    notesY
  );

  notesY += 8;

  doc.text("CONDICIONES DE VENTA:", 14, notesY);
  notesY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("CRÉDITO: Crédito 15 Días", 14, notesY);
  notesY += 5;
  doc.text("ENVÍO: $0.00", 14, notesY);
  notesY += 7;

  doc.setFont("helvetica", "bold");
  doc.text("NOTAS: Términos y Condiciones", 14, notesY);
  notesY += 5;

  const notesLines = [
    "1.- La presente cotización es válida por 15 días naturales a partir de su fecha de emisión.",
    "2.- Los precios están expresados en [MXN / USD] y no incluyen IVA, salvo que se indique expresamente lo contrario.",
    "3.- El alcance se limita exclusivamente a los productos y/o servicios descritos en esta cotización.",
    "4.- Los tiempos de entrega y/o ejecución son estimados y pueden variar por causas ajenas a Punto Cero Soluciones.",
    "5.- Los productos cuentan con la garantía otorgada por el fabricante correspondiente.",
    "6.- Los servicios cuentan con garantía limitada únicamente por defectos de ejecución.",
    "7.- La aceptación de esta cotización implica la conformidad del cliente con estos términos y condiciones.",
  ];

  doc.setFont("helvetica", "normal");
  notesLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 180);
    doc.text(wrapped, 14, notesY);
    notesY += wrapped.length * 4.2 + 1;
  });

  notesY += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("A T E N T A M E N T E", 14, notesY);

  notesY += 14;

  if (employee?.signatureImage) {
    try {
      doc.addImage(employee.signatureImage, "PNG", 14, notesY - 10, 34, 15);
    } catch {
      // no romper
    }
  }

  notesY += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(safeText(employee?.fullName), 14, notesY);
  notesY += 5;
  doc.text("-", 14, notesY);
  notesY += 5;
  doc.text("-", 14, notesY);
  notesY += 5;
  doc.text(safeText(employee?.position), 14, notesY);

  // Redibuja footer con total de páginas
  const totalPages = doc.getNumberOfPages();


  doc.save(`${quote.folio}.pdf`);
}
