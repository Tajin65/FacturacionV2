import React, { useEffect, useMemo, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { CLIENTS_STORAGE_KEY, CONTACTS_STORAGE_KEY } from "../data/storageKeys";
import type { Client, Contact, ContactFormState } from "../types/models";

const blankContact: ContactFormState = {
  id: "",
  clientId: "",
  fullName: "",
  position: "",
  email: "",
  phone: "",
  notes: "",
};

export default function ContactsModule() {
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactForm, setContactForm] = useState<ContactFormState>(blankContact);
  const [editingContactId, setEditingContactId] = useState("");
  const [contactSearch, setContactSearch] = useState("");

  useEffect(() => {
    const savedClients = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (savedClients) {
      try {
        setClients(JSON.parse(savedClients));
      } catch {
        setClients([]);
      }
    }
  }, []);

  useEffect(() => {
    const savedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!savedContacts) return;
    try {
      setContacts(JSON.parse(savedContacts));
    } catch {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((contact) =>
      [
        contact.fullName,
        contact.position,
        contact.email,
        contact.phone,
        contact.notes,
        clients.find((client) => client.id === contact.clientId)?.businessName || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [contacts, contactSearch, clients]);

  function resetContactForm() {
    setContactForm(blankContact);
    setEditingContactId("");
  }

  function saveContact() {
    if (!contactForm.clientId || !contactForm.fullName.trim()) {
      alert("Selecciona un cliente y captura al menos el nombre del contacto.");
      return;
    }

    const payload: Contact = {
      id: editingContactId || crypto.randomUUID(),
      clientId: contactForm.clientId,
      fullName: contactForm.fullName.trim(),
      position: contactForm.position.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim(),
      notes: contactForm.notes.trim(),
    };

    if (editingContactId) {
      setContacts((prev) =>
        prev.map((item) => (item.id === editingContactId ? payload : item))
      );
    } else {
      setContacts((prev) => [...prev, payload]);
    }

    resetContactForm();
  }

  function editContact(contact: Contact) {
    setContactForm({
      id: contact.id,
      clientId: contact.clientId,
      fullName: contact.fullName,
      position: contact.position,
      email: contact.email,
      phone: contact.phone,
      notes: contact.notes,
    });
    setEditingContactId(contact.id);
  }

  function deleteContact(id: string) {
    const confirmed = window.confirm("¿Deseas eliminar este contacto?");
    if (!confirmed) return;
    setContacts((prev) => prev.filter((item) => item.id !== id));
    if (editingContactId === id) resetContactForm();
  }

  return (
    <div className="content-stack">
      <SectionCard
        title={editingContactId ? "Editar contacto" : "Alta de contacto"}
        right={
          <button className="btn btn-secondary" onClick={resetContactForm}>
            Limpiar
          </button>
        }
      >
        <div className="form-grid">
          <div className="field">
            <label>Cliente</label>
            <select
              value={contactForm.clientId}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, clientId: e.target.value }))
              }
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
            <label>Nombre completo</label>
            <input
              value={contactForm.fullName}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Puesto</label>
            <input
              value={contactForm.position}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, position: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Teléfono</label>
            <input
              value={contactForm.phone}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Notas</label>
            <textarea
              value={contactForm.notes}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, notes: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={saveContact}>
            {editingContactId ? "Guardar cambios" : "Agregar contacto"}
          </button>
          <button className="btn btn-secondary" onClick={resetContactForm}>
            Cancelar
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Lista de contactos">
        <div className="search-box">
          <div className="field">
            <label>Buscar</label>
            <input
              value={contactSearch}
              placeholder="Buscar por contacto, cliente, puesto, email o teléfono"
              onChange={(e) => setContactSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Nombre</th>
                <th>Puesto</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    Todavía no hay contactos registrados.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const client = clients.find((item) => item.id === contact.clientId);
                  return (
                    <tr key={contact.id}>
                      <td>{client?.businessName || "Cliente no encontrado"}</td>
                      <td>{contact.fullName}</td>
                      <td>{contact.position}</td>
                      <td>{contact.email}</td>
                      <td>{contact.phone}</td>
                      <td>{contact.notes}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary" onClick={() => editContact(contact)}>
                            Editar
                          </button>
                          <button
                            className="btn btn-secondary btn-danger"
                            onClick={() => deleteContact(contact.id)}
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
