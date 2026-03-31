import React, { useEffect, useMemo, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { CLIENTS_STORAGE_KEY } from "../data/storageKeys";
import type { Client, ClientFormState } from "../types/models";

const blankClient: ClientFormState = {
  id: "",
  businessName: "",
  legalName: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "México",
  creditDaysInput: "",
  notes: "",
};

export default function ClientsModule() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientForm, setClientForm] = useState<ClientFormState>(blankClient);
  const [editingClientId, setEditingClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!saved) return;
    try {
      setClients(JSON.parse(saved));
    } catch {
      setClients([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) =>
      [
        client.businessName,
        client.legalName,
        client.taxId,
        client.email,
        client.phone,
        client.address,
        client.city,
        client.state,
        client.country,
        client.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clients, clientSearch]);

  function resetClientForm() {
    setClientForm(blankClient);
    setEditingClientId("");
  }

  function saveClient() {
    if (!clientForm.businessName.trim()) {
      alert("Captura al menos el nombre comercial del cliente.");
      return;
    }

    const payload: Client = {
      id: editingClientId || crypto.randomUUID(),
      businessName: clientForm.businessName.trim(),
      legalName: clientForm.legalName.trim(),
      taxId: clientForm.taxId.trim(),
      email: clientForm.email.trim(),
      phone: clientForm.phone.trim(),
      address: clientForm.address.trim(),
      city: clientForm.city.trim(),
      state: clientForm.state.trim(),
      country: clientForm.country.trim(),
      creditDays: Number(clientForm.creditDaysInput || 0),
      notes: clientForm.notes.trim(),
    };

    if (editingClientId) {
      setClients((prev) =>
        prev.map((item) => (item.id === editingClientId ? payload : item))
      );
    } else {
      setClients((prev) => [...prev, payload]);
    }

    resetClientForm();
  }

  function editClient(client: Client) {
    setClientForm({
      id: client.id,
      businessName: client.businessName,
      legalName: client.legalName,
      taxId: client.taxId,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      state: client.state,
      country: client.country,
      creditDaysInput: String(client.creditDays || ""),
      notes: client.notes,
    });
    setEditingClientId(client.id);
  }

  function deleteClient(id: string) {
    const confirmed = window.confirm("¿Deseas eliminar este cliente?");
    if (!confirmed) return;
    setClients((prev) => prev.filter((item) => item.id !== id));
    if (editingClientId === id) resetClientForm();
  }

  return (
    <div className="content-stack">
      <SectionCard
        title={editingClientId ? "Editar cliente" : "Alta de cliente"}
        right={
          <button className="btn btn-secondary" onClick={resetClientForm}>
            Limpiar
          </button>
        }
      >
        <div className="form-grid">
          <div className="field">
            <label>Nombre comercial</label>
            <input
              value={clientForm.businessName}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, businessName: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Razón social</label>
            <input
              value={clientForm.legalName}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, legalName: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>RFC</label>
            <input
              value={clientForm.taxId}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, taxId: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={clientForm.email}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Teléfono</label>
            <input
              value={clientForm.phone}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Días de crédito</label>
            <input
              type="number"
              value={clientForm.creditDaysInput}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, creditDaysInput: e.target.value }))
              }
            />
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Dirección</label>
            <input
              value={clientForm.address}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Ciudad</label>
            <input
              value={clientForm.city}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, city: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Estado</label>
            <input
              value={clientForm.state}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, state: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>País</label>
            <input
              value={clientForm.country}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, country: e.target.value }))
              }
            />
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Notas</label>
            <textarea
              value={clientForm.notes}
              onChange={(e) =>
                setClientForm((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={saveClient}>
            {editingClientId ? "Guardar cambios" : "Agregar cliente"}
          </button>
          <button className="btn btn-secondary" onClick={resetClientForm}>
            Cancelar
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Lista de clientes">
        <div className="search-box">
          <div className="field">
            <label>Buscar</label>
            <input
              value={clientSearch}
              placeholder="Buscar por nombre, RFC, email, ciudad o teléfono"
              onChange={(e) => setClientSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Nombre comercial</th>
                <th>Razón social</th>
                <th>RFC</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Crédito</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    Todavía no hay clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.businessName}</td>
                    <td>{client.legalName}</td>
                    <td>{client.taxId}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.city}</td>
                    <td>{client.state}</td>
                    <td>{client.creditDays} días</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" onClick={() => editClient(client)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-secondary btn-danger"
                          onClick={() => deleteClient(client.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
