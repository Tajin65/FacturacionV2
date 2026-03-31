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
  calculateQuoteLineSubtotal,
  calculateQuoteSubtotal,
  calculateQuoteTax,
  calculateQuoteTotal,
} from "../utils/calculations";
import type {
  Client,
  Contact,
  Employee,
  Product,
  Quote,
  QuoteFormState,
  QuoteItem,
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
};

export default function QuotesModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const [quoteForm, setQuoteForm] = useState<QuoteFormState>(blankQuoteForm);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");

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

  const quoteSubtotal = useMemo(() => calculateQuoteSubtotal(quoteItems), [quoteItems]);

  const taxRatePercent = useMemo(
    () => Number(quoteForm.taxRatePercentInput || 0),
    [quoteForm.taxRatePercentInput]
  );

  const quoteTax = useMemo(
    () => calculateQuoteTax(quoteSubtotal, taxRatePercent),
    [quoteSubtotal, taxRatePercent]
  );

  const quoteTotal = useMemo(
    () => calculateQuoteTotal(quoteSubtotal, taxRatePercent),
    [quoteSubtotal, taxRatePercent]
  );

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

  function resetQuoteForm() {
    setQuoteForm({
      ...blankQuoteForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setQuoteItems([]);
    setSelectedProductId("");
    setSelectedQuantity("1");
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
    if (quantity <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    const unitPrice = selectedProduct.salePrice;
    const lineSubtotal = calculateQuoteLineSubtotal(quantity, unitPrice);

    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      quantity,
      unitPrice,
      lineSubtotal,
    };

    setQuoteItems((prev) => [...prev, newItem]);
    setSelectedProductId("");
    setSelectedQuantity("1");
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
      id: crypto.randomUUID(),
      folio: generateQuoteFolio(),
      date: quoteForm.date,
      clientId: quoteForm.clientId,
      contactId: quoteForm.contactId,
      employeeId: quoteForm.employeeId,
      projectName: quoteForm.projectName.trim(),
      currency: quoteForm.currency,
      exchangeRate: Number(quoteForm.exchangeRateInput || 1),
      notes: quoteForm.notes.trim(),
      taxRatePercent: Number(quoteForm.taxRatePercentInput || 0),
      items: quoteItems,
      subtotal: quoteSubtotal,
      tax: quoteTax,
      total: quoteTotal,
    };

    setQuotes((prev) => [payload, ...prev]);
    resetQuoteForm();
  }

  function deleteQuote(id: string) {
    const confirmed = window.confirm("¿Deseas eliminar esta cotización?");
    if (!confirmed) return;
    setQuotes((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="content-stack">
      <SectionCard title="Alta de cotización">
        <div className="form-grid">
          <div className="field">
            <label>Folio</label>
            <input value="Se generará automáticamente al guardar" disabled />
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
            <small style={{ color: "#5b6b84" }}>
              Automático: MXN = 1, USD = 18.12
            </small>
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
      </SectionCard>

      <SectionCard title="Agregar partida">
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

          <div className="info-box">
            <div className="info-box-label">Precio unitario</div>
            <div className="info-box-value">
              {selectedProduct ? money(selectedProduct.salePrice, selectedProduct.currency) : "$0.00"}
            </div>
          </div>

          <div className="info-box">
            <div className="info-box-label">Subtotal línea</div>
            <div className="info-box-value">
              {selectedProduct
                ? money(
                    calculateQuoteLineSubtotal(
                      Number(selectedQuantity || 0),
                      selectedProduct.salePrice
                    ),
                    selectedProduct.currency
                  )
                : "$0.00"}
            </div>
          </div>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={addQuoteItem}>
            Agregar partida
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Partidas de la cotización">
        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>No. parte</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quoteItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Todavía no hay partidas agregadas.
                  </td>
                </tr>
              ) : (
                quoteItems.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <tr key={item.id}>
                      <td>{product?.partNumber || "-"}</td>
                      <td>{product?.shortName || "Producto no encontrado"}</td>
                      <td>{item.quantity}</td>
                      <td>{money(item.unitPrice, quoteForm.currency)}</td>
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
            <div className="info-box-label">Subtotal</div>
            <div className="info-box-value">{money(quoteSubtotal, quoteForm.currency)}</div>
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

        <div className="button-row">
          <button className="btn btn-primary" onClick={saveQuote}>
            Guardar cotización
          </button>
          <button className="btn btn-secondary" onClick={resetQuoteForm}>
            Limpiar
          </button>
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
                <th>Moneda</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
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
                      <td>{quote.currency}</td>
                      <td>{money(quote.total, quote.currency)}</td>
                      <td>
                        <div className="table-actions">
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
