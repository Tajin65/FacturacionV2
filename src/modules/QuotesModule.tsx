import React, { useEffect, useMemo, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import {
  CLIENTS_STORAGE_KEY,
  CONTACTS_STORAGE_KEY,
  EMPLOYEES_STORAGE_KEY,
  PRODUCTS_STORAGE_KEY,
  QUOTES_STORAGE_KEY,
} from "../data/storageKeys";
import { money } from "../utils/format";
import {
  calculateQuoteSubtotal,
  calculateQuoteTax,
} from "../utils/calculations";
import { exportQuoteToPdf } from "../utils/quotePdf";
import type {
  Client,
  Contact,
  Employee,
  Product,
  Quote,
  QuoteFormState,
  QuoteItem,
  QuoteStatus,
} from "../types/models";

const blankQuoteForm: QuoteFormState = {
  id: "",
  folio: "",
  date: new Date().toISOString().slice(0, 10),
  clientId: "",
  contactId: "",
  employeeId: "",
  projectName: "",
  currency: "MXN",
  exchangeRateInput: "1",
  notes: "",
  taxRatePercentInput: "16",
  status: "abierta",
  discountAmountInput: "0",
  laborAmountInput: "0",
};

export default function QuotesModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const [quoteForm, setQuoteForm] = useState<QuoteFormState>(blankQuoteForm);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [editingQuoteId, setEditingQuoteId] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [selectedPerUnitDiscount, setSelectedPerUnitDiscount] = useState("0");

  const [freeItemName, setFreeItemName] = useState("");
  const [freeItemDescription, setFreeItemDescription] = useState("");
  const [freeItemQuantity, setFreeItemQuantity] = useState("1");
  const [freeItemUnitPrice, setFreeItemUnitPrice] = useState("");
  const [freeItemPerUnitDiscount, setFreeItemPerUnitDiscount] = useState("0");

  useEffect(() => {
    try {
      setProducts(JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || "[]"));
      setEmployees(JSON.parse(localStorage.getItem(EMPLOYEES_STORAGE_KEY) || "[]"));
      setClients(JSON.parse(localStorage.getItem(CLIENTS_STORAGE_KEY) || "[]"));
      setContacts(JSON.parse(localStorage.getItem(CONTACTS_STORAGE_KEY) || "[]"));
      setQuotes(JSON.parse(localStorage.getItem(QUOTES_STORAGE_KEY) || "[]"));
    } catch {
      setProducts([]);
      setEmployees([]);
      setClients([]);
      setContacts([]);
      setQuotes([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    setQuoteForm((prev) => ({
      ...prev,
      exchangeRateInput: prev.currency === "USD" ? "18.12" : "1",
    }));
  }, [quoteForm.currency]);

  const filteredContacts = useMemo(() => {
    if (!quoteForm.clientId) return [];
    return contacts.filter((contact) => contact.clientId === quoteForm.clientId);
  }, [contacts, quoteForm.clientId]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const itemsSubtotal = useMemo(() => calculateQuoteSubtotal(quoteItems), [quoteItems]);

  const laborAmount = useMemo(
    () => Number(quoteForm.laborAmountInput || 0),
    [quoteForm.laborAmountInput]
  );

  const discountAmount = useMemo(
    () => Number(quoteForm.discountAmountInput || 0),
    [quoteForm.discountAmountInput]
  );

  const preTaxSubtotal = useMemo(() => {
    const value = itemsSubtotal + laborAmount - discountAmount;
    return value < 0 ? 0 : value;
  }, [itemsSubtotal, laborAmount, discountAmount]);

  const taxRatePercent = useMemo(
    () => Number(quoteForm.taxRatePercentInput || 0),
    [quoteForm.taxRatePercentInput]
  );

  const quoteTax = useMemo(
    () => calculateQuoteTax(preTaxSubtotal, taxRatePercent),
    [preTaxSubtotal, taxRatePercent]
  );

  const quoteTotal = useMemo(() => preTaxSubtotal + quoteTax, [preTaxSubtotal, quoteTax]);

  function getInitials(fullName: string) {
    return fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 4);
  }

  function getYearTwoDigits(dateValue: string) {
    if (!dateValue) return "00";
    return dateValue.slice(2, 4);
  }

  function generateQuoteFolio() {
    const employee = employees.find((item) => item.id === quoteForm.employeeId);
    const initials = employee ? getInitials(employee.fullName) : "XXXX";
    const yearTwoDigits = getYearTwoDigits(quoteForm.date);

    const maxConsecutive = quotes.reduce((max, quote) => {
      const match = quote.folio.match(/^P(\d{3})/);
      const current = match ? Number(match[1]) : 0;
      return current > max ? current : max;
    }, 0);

    const consecutive = String(maxConsecutive + 1).padStart(3, "0");
    return `P${consecutive}${initials}${yearTwoDigits}`;
  }

  function calculateLineSubtotal(quantity: number, unitPrice: number, perUnitDiscount: number) {
    const netUnitPrice = Math.max(0, unitPrice - perUnitDiscount);
    return quantity * netUnitPrice;
  }

  function resetQuoteForm() {
    setQuoteForm({
      ...blankQuoteForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setQuoteItems([]);
    setSelectedProductId("");
    setSelectedQuantity("1");
    setSelectedPerUnitDiscount("0");
    setFreeItemName("");
    setFreeItemDescription("");
    setFreeItemQuantity("1");
    setFreeItemUnitPrice("");
    setFreeItemPerUnitDiscount("0");
    setEditingQuoteId("");
  }

  function handleClientChange(clientId: string) {
    setQuoteForm((prev) => ({
      ...prev,
      clientId,
      contactId: "",
    }));
  }

  function addQuoteItem() {
    if (!selectedProduct) {
      alert("Selecciona un producto.");
      return;
    }

    const quantity = Number(selectedQuantity || 0);
    const unitPrice = selectedProduct.salePrice;
    const perUnitDiscount = Number(selectedPerUnitDiscount || 0);

    if (quantity <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    const lineSubtotal = calculateLineSubtotal(quantity, unitPrice, perUnitDiscount);

    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      quantity,
      unitPrice,
      lineSubtotal,
      itemType: "producto",
      perUnitDiscount,
    };

    setQuoteItems((prev) => [...prev, newItem]);
    setSelectedProductId("");
    setSelectedQuantity("1");
    setSelectedPerUnitDiscount("0");
  }

  function addFreeItem() {
    if (!freeItemName.trim()) {
      alert("Captura el nombre del producto libre.");
      return;
    }

    const quantity = Number(freeItemQuantity || 0);
    const unitPrice = Number(freeItemUnitPrice || 0);
    const perUnitDiscount = Number(freeItemPerUnitDiscount || 0);

    if (quantity <= 0) {
      alert("La cantidad del producto libre debe ser mayor a 0.");
      return;
    }

    const lineSubtotal = calculateLineSubtotal(quantity, unitPrice, perUnitDiscount);

    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      productId: "",
      quantity,
      unitPrice,
      lineSubtotal,
      isFreeItem: true,
      freeItemName: freeItemName.trim(),
      freeItemDescription: freeItemDescription.trim(),
      itemType: "libre",
      perUnitDiscount,
    };

    setQuoteItems((prev) => [...prev, newItem]);

    setFreeItemName("");
    setFreeItemDescription("");
    setFreeItemQuantity("1");
    setFreeItemUnitPrice("");
    setFreeItemPerUnitDiscount("0");
  }

  function removeQuoteItem(itemId: string) {
    setQuoteItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function saveQuote() {
    if (!quoteForm.clientId) {
      alert("Selecciona un cliente.");
      return;
    }

    if (!quoteForm.employeeId) {
      alert("Selecciona un vendedor.");
      return;
    }

    if (quoteItems.length === 0) {
      alert("Agrega al menos una partida.");
      return;
    }

    const payload: Quote = {
      id: editingQuoteId || crypto.randomUUID(),
      folio: editingQuoteId
        ? quotes.find((q) => q.id === editingQuoteId)?.folio || generateQuoteFolio()
        : generateQuoteFolio(),
      date: quoteForm.date,
      clientId: quoteForm.clientId,
      contactId: quoteForm.contactId,
      employeeId: quoteForm.employeeId,
      projectName: quoteForm.projectName.trim(),
      currency: quoteForm.currency,
      exchangeRate: Number(quoteForm.exchangeRateInput || 1),
      notes: quoteForm.notes.trim(),
      taxRatePercent: Number(quoteForm.taxRatePercentInput || 0),
      status: quoteForm.status,
      discountAmount: discountAmount,
      laborAmount: laborAmount,
      items: quoteItems,
      subtotal: preTaxSubtotal,
      tax: quoteTax,
      total: quoteTotal,
    };

    if (editingQuoteId) {
      setQuotes((prev) => prev.map((q) => (q.id === editingQuoteId ? payload : q)));
    } else {
      setQuotes((prev) => [payload, ...prev]);
    }

    resetQuoteForm();
  }

  function editQuote(quote: Quote) {
    setQuoteForm({
      id: quote.id,
      folio: quote.folio,
      date: quote.date,
      clientId: quote.clientId,
      contactId: quote.contactId,
      employeeId: quote.employeeId,
      projectName: quote.projectName,
      currency: quote.currency,
      exchangeRateInput: String(quote.exchangeRate),
      notes: quote.notes,
      taxRatePercentInput: String(quote.taxRatePercent),
      status: quote.status,
      discountAmountInput: String(quote.discountAmount || 0),
      laborAmountInput: String(quote.laborAmount || 0),
    });
    setQuoteItems(quote.items || []);
    setEditingQuoteId(quote.id);
  }

  function deleteQuote(id: string) {
    const confirmed = window.confirm("¿Deseas eliminar esta cotización?");
    if (!confirmed) return;
    setQuotes((prev) => prev.filter((item) => item.id !== id));
    if (editingQuoteId === id) resetQuoteForm();
  }

  function updateQuoteStatus(id: string, status: QuoteStatus) {
    setQuotes((prev) =>
      prev.map((quote) => (quote.id === id ? { ...quote, status } : quote))
    );
  }

  function getStatusLabel(status: QuoteStatus) {
    switch (status) {
      case "abierta":
        return "Abierta";
      case "en_proceso":
        return "En proceso";
      case "cerrada":
        return "Cerrada";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  }

  function exportPdf(quote: Quote) {
    const client = clients.find((c) => c.id === quote.clientId);
    const contact = contacts.find((c) => c.id === quote.contactId);
    const employee = employees.find((e) => e.id === quote.employeeId);

    exportQuoteToPdf({
      quote,
      client,
      contact,
      employee,
      products,
    });
  }

  return (
    <div className="content-stack">
      <SectionCard title={editingQuoteId ? "Editar cotización" : "Alta de cotización"}>
        <div className="form-grid">
          <div className="field">
            <label>Folio</label>
            <input
              value={
                editingQuoteId
                  ? quoteForm.folio || "Se conservará el folio actual"
                  : "Se generará automáticamente al guardar"
              }
              disabled
            />
          </div>

          <div className="field">
            <label>Fecha</label>
            <input
              type="date"
              value={quoteForm.date}
              onChange={(e) =>
                setQuoteForm((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Cliente</label>
            <select
              value={quoteForm.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              <option value="">Selecciona un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.businessName}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Contacto</label>
            <select
              value={quoteForm.contactId}
              onChange={(e) =>
                setQuoteForm((prev) => ({ ...prev, contactId: e.target.value }))
              }
            >
              <option value="">Selecciona un contacto</option>
              {filteredContacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Vendedor</label>
            <select
              value={quoteForm.employeeId}
              onChange={(e) =>
                setQuoteForm((prev) => ({ ...prev, employeeId: e.target.value }))
              }
            >
              <option value="">Selecciona un vendedor</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Proyecto</label>
            <input
              value={quoteForm.projectName}
              onChange={(e) =>
                setQuoteForm((prev) => ({ ...prev, projectName: e.target.value }))
              }
              placeholder="Nombre del proyecto"
            />
          </div>

          <div className="field">
            <label>Moneda</label>
            <select
              value={quoteForm.currency}
              onChange={(e) =>
                setQuoteForm((prev) => ({
                  ...prev,
                  currency: e.target.value as "MXN" | "USD",
                }))
              }
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="field">
            <label>Tipo de cambio</label>
            <input
              type="number"
              value={quoteForm.exchangeRateInput}
              onChange={(e) =>
                setQuoteForm((prev) => ({ ...prev, exchangeRateInput: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>IVA %</label>
            <input
              type="number"
              value={quoteForm.taxRatePercentInput}
              onChange={(e) =>
                setQuoteForm((prev) => ({ ...prev, taxRatePercentInput: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Estatus</label>
            <select
              value={quoteForm.status}
              onChange={(e) =>
                setQuoteForm((prev) => ({
                  ...prev,
                  status: e.target.value as QuoteStatus,
                }))
              }
            >
              <option value="abierta">Abierta</option>
              <option value="en_proceso">En proceso</option>
              <option value="cerrada">Cerrada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="field">
            <label>Descuento global</label>
            <input
              type="number"
              value={quoteForm.discountAmountInput}
              onChange={(e) =>
                setQuoteForm((prev) => ({ ...prev, discountAmountInput: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Mano de obra</label>
            <input
              type="number"
              value={quoteForm.laborAmountInput}
              onChange={(e) =>
                setQuoteForm((prev) => ({ ...prev, laborAmountInput: e.target.value }))
              }
            />
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Notas</label>
            <textarea
              value={quoteForm.notes}
              onChange={(e) =>
                setQuoteForm((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={saveQuote}>
            {editingQuoteId ? "Guardar cambios" : "Guardar cotización"}
          </button>
          <button className="btn btn-secondary" onClick={resetQuoteForm}>
            Limpiar
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Agregar producto del catálogo">
        <div className="form-grid">
          <div className="field">
            <label>Producto</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.shortName} ({product.partNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Cantidad</label>
            <input
              type="number"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Descuento por pieza</label>
            <input
              type="number"
              value={selectedPerUnitDiscount}
              onChange={(e) => setSelectedPerUnitDiscount(e.target.value)}
            />
          </div>

          <div className="info-box">
            <div className="info-box-label">Precio unitario</div>
            <div className="info-box-value">
              {selectedProduct ? money(selectedProduct.salePrice, selectedProduct.currency) : "$0.00"}
            </div>
          </div>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={addQuoteItem}>
            Agregar partida
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Agregar producto libre">
        <div className="form-grid">
          <div className="field">
            <label>Nombre</label>
            <input
              value={freeItemName}
              onChange={(e) => setFreeItemName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Cantidad</label>
            <input
              type="number"
              value={freeItemQuantity}
              onChange={(e) => setFreeItemQuantity(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Precio unitario</label>
            <input
              type="number"
              value={freeItemUnitPrice}
              onChange={(e) => setFreeItemUnitPrice(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Descuento por pieza</label>
            <input
              type="number"
              value={freeItemPerUnitDiscount}
              onChange={(e) => setFreeItemPerUnitDiscount(e.target.value)}
            />
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Descripción</label>
            <textarea
              value={freeItemDescription}
              onChange={(e) => setFreeItemDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={addFreeItem}>
            Agregar producto libre
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Partidas de la cotización">
        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>No. parte</th>
                <th>Concepto</th>
                <th>Cantidad</th>
                <th>P. unitario</th>
                <th>Desc. pza</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quoteItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    Todavía no hay partidas agregadas.
                  </td>
                </tr>
              ) : (
                quoteItems.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  const conceptName = item.isFreeItem
                    ? item.freeItemName || "Producto libre"
                    : product?.shortName || "Producto no encontrado";

                  return (
                    <tr key={item.id}>
                      <td>{item.itemType === "libre" ? "Libre" : "Catálogo"}</td>
                      <td>{item.isFreeItem ? "-" : product?.partNumber || "-"}</td>
                      <td>{conceptName}</td>
                      <td>{item.quantity}</td>
                      <td>{money(item.unitPrice, quoteForm.currency)}</td>
                      <td>{money(item.perUnitDiscount || 0, quoteForm.currency)}</td>
                      <td>{money(item.lineSubtotal, quoteForm.currency)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-secondary btn-danger"
                            onClick={() => removeQuoteItem(item.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Totales">
        <div className="stats-grid">
          <div className="info-box">
            <div className="info-box-label">Subtotal partidas</div>
            <div className="info-box-value">{money(itemsSubtotal, quoteForm.currency)}</div>
          </div>

          <div className="info-box">
            <div className="info-box-label">Mano de obra</div>
            <div className="info-box-value">{money(laborAmount, quoteForm.currency)}</div>
          </div>

          <div className="info-box">
            <div className="info-box-label">Descuento global</div>
            <div className="info-box-value">{money(discountAmount, quoteForm.currency)}</div>
          </div>

          <div className="info-box">
            <div className="info-box-label">Subtotal neto</div>
            <div className="info-box-value">{money(preTaxSubtotal, quoteForm.currency)}</div>
          </div>

          <div className="info-box">
            <div className="info-box-label">IVA</div>
            <div className="info-box-value">{money(quoteTax, quoteForm.currency)}</div>
          </div>

          <div className="info-box">
            <div className="info-box-label">Total</div>
            <div className="info-box-value">{money(quoteTotal, quoteForm.currency)}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Cotizaciones guardadas">
        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Proyecto</th>
                <th>Estatus</th>
                <th>Moneda</th>
                <th>Total</th>
                <th>Cambiar estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    Todavía no hay cotizaciones registradas.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => {
                  const client = clients.find((c) => c.id === quote.clientId);
                  return (
                    <tr key={quote.id}>
                      <td>{quote.folio}</td>
                      <td>{quote.date}</td>
                      <td>{client?.businessName || "Cliente no encontrado"}</td>
                      <td>{quote.projectName}</td>
                      <td>{getStatusLabel(quote.status)}</td>
                      <td>{quote.currency}</td>
                      <td>{money(quote.total, quote.currency)}</td>
                      <td>
                        <select
                          value={quote.status}
                          onChange={(e) =>
                            updateQuoteStatus(quote.id, e.target.value as QuoteStatus)
                          }
                        >
                          <option value="abierta">Abierta</option>
                          <option value="en_proceso">En proceso</option>
                          <option value="cerrada">Cerrada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary" onClick={() => editQuote(quote)}>
                            Editar
                          </button>
                          <button className="btn btn-secondary" onClick={() => exportPdf(quote)}>
                            PDF
                          </button>
                          <button
                            className="btn btn-secondary btn-danger"
                            onClick={() => deleteQuote(quote.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
