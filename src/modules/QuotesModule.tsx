async function exportPdf(quote: Quote) {
  const client = clients.find((c) => c.id === quote.clientId);
  const contact = contacts.find((c) => c.id === quote.contactId);
  const employee = employees.find((e) => e.id === quote.employeeId);

  let logoSrc = "";

  try {
    const response = await fetch("/logo-punto-cero.png");
    const blob = await response.blob();

    logoSrc = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    logoSrc = "";
  }

  exportQuoteToPdf({
    quote,
    client,
    contact,
    employee,
    products,
    logoSrc,
  });
}
