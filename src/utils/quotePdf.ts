const labelX = 14;
const valueX = 48;

doc.setFont("helvetica", "bold");
doc.text("CLIENTE:", labelX, 50);
doc.setFont("helvetica", "normal");
doc.text(client?.businessName || "-", valueX, 50);

doc.setFont("helvetica", "bold");
doc.text("RAZÓN SOCIAL:", labelX, 56);
doc.setFont("helvetica", "normal");
doc.text(client?.legalName || "-", valueX, 56);

doc.setFont("helvetica", "bold");
doc.text("RFC:", labelX, 62);
doc.setFont("helvetica", "normal");
doc.text(client?.taxId || "-", valueX, 62);

doc.setFont("helvetica", "bold");
doc.text("CONTACTO:", labelX, 68);
doc.setFont("helvetica", "normal");
doc.text(contact?.fullName || "-", valueX, 68);

doc.setFont("helvetica", "bold");
doc.text("VENDEDOR:", labelX, 74);
doc.setFont("helvetica", "normal");
doc.text(employee?.fullName || "-", valueX, 74);

doc.setFont("helvetica", "bold");
doc.text("PUESTO:", labelX, 80);
doc.setFont("helvetica", "normal");
doc.text(employee?.position || "-", valueX, 80);

doc.setFont("helvetica", "bold");
doc.text("PROYECTO:", labelX, 86);
doc.setFont("helvetica", "normal");
doc.text(quote.projectName || "-", valueX, 86);
