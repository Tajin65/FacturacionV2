import React, { useEffect, useMemo, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { EMPLOYEES_STORAGE_KEY } from "../data/storageKeys";
import type { Employee, EmployeeFormState, EmployeeRole } from "../types/models";

const blankEmployee: EmployeeFormState = {
  id: "",
  fullName: "",
  initials: "",
  position: "",
  email: "",
  phone: "",
  signatureText: "",
  signatureImage: "",
  role: "sales",
  canEditQuoteTerms: false,
};

export default function EmployeesModule() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>(blankEmployee);
  const [editingEmployeeId, setEditingEmployeeId] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (!saved) return;
    try {
      setEmployees(JSON.parse(saved));
    } catch {
      setEmployees([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((employee) =>
      [
        employee.fullName,
        employee.initials,
        employee.position,
        employee.email,
        employee.phone,
        employee.signatureText,
        employee.role,
        employee.canEditQuoteTerms ? "permiso terminos" : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [employees, employeeSearch]);

  function resetEmployeeForm() {
    setEmployeeForm(blankEmployee);
    setEditingEmployeeId("");
  }

  function saveEmployee() {
    if (!employeeForm.fullName.trim() || !employeeForm.initials.trim()) {
      alert("Captura al menos nombre completo e iniciales.");
      return;
    }

    const payload: Employee = {
      id: editingEmployeeId || crypto.randomUUID(),
      fullName: employeeForm.fullName.trim(),
      initials: employeeForm.initials.trim().toUpperCase().slice(0, 6),
      position: employeeForm.position.trim(),
      email: employeeForm.email.trim(),
      phone: employeeForm.phone.trim(),
      signatureText: employeeForm.signatureText.trim(),
      signatureImage: employeeForm.signatureImage,
      role: employeeForm.role,
      canEditQuoteTerms: employeeForm.canEditQuoteTerms,
    };

    if (editingEmployeeId) {
      setEmployees((prev) =>
        prev.map((item) => (item.id === editingEmployeeId ? payload : item))
      );
    } else {
      setEmployees((prev) => [...prev, payload]);
    }

    resetEmployeeForm();
  }

  function editEmployee(employee: Employee) {
    setEmployeeForm({
      id: employee.id,
      fullName: employee.fullName,
      initials: employee.initials,
      position: employee.position,
      email: employee.email,
      phone: employee.phone,
      signatureText: employee.signatureText,
      signatureImage: employee.signatureImage || "",
      role: employee.role || "sales",
      canEditQuoteTerms: employee.canEditQuoteTerms || false,
    });
    setEditingEmployeeId(employee.id);
  }

  function deleteEmployee(id: string) {
    const confirmed = window.confirm("¿Deseas eliminar este empleado?");
    if (!confirmed) return;
    setEmployees((prev) => prev.filter((item) => item.id !== id));
    if (editingEmployeeId === id) resetEmployeeForm();
  }

  function handleEmployeeSignatureUpload(file: File | null) {
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Solo se permiten archivos PNG o JPG/JPEG.");
      return;
    }

    if (file.size > 300 * 1024) {
      alert("La firma es muy pesada. Intenta con una imagen menor a 300 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setEmployeeForm((prev) => ({
        ...prev,
        signatureImage: result,
      }));
    };
    reader.readAsDataURL(file);
  }

  function roleLabel(role: EmployeeRole) {
    switch (role) {
      case "admin":
        return "Administrador";
      case "sales":
        return "Ventas";
      case "viewer":
        return "Consulta";
      default:
        return role;
    }
  }

  return (
    <div className="content-stack">
      <SectionCard
        title={editingEmployeeId ? "Editar empleado" : "Alta de empleado"}
        right={
          <button className="btn btn-secondary" onClick={resetEmployeeForm}>
            Limpiar
          </button>
        }
      >
        <div className="form-grid">
          <div className="field">
            <label>Nombre completo</label>
            <input
              value={employeeForm.fullName}
              onChange={(e) =>
                setEmployeeForm((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Iniciales</label>
            <input
              value={employeeForm.initials}
              onChange={(e) =>
                setEmployeeForm((prev) => ({ ...prev, initials: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Cargo</label>
            <input
              value={employeeForm.position}
              onChange={(e) =>
                setEmployeeForm((prev) => ({ ...prev, position: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={employeeForm.email}
              onChange={(e) =>
                setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Teléfono</label>
            <input
              value={employeeForm.phone}
              onChange={(e) =>
                setEmployeeForm((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Rol</label>
            <select
              value={employeeForm.role}
              onChange={(e) =>
                setEmployeeForm((prev) => ({
                  ...prev,
                  role: e.target.value as EmployeeRole,
                }))
              }
            >
              <option value="admin">Administrador</option>
              <option value="sales">Ventas</option>
              <option value="viewer">Consulta</option>
            </select>
          </div>

          <div className="field" style={{ display: "flex", alignItems: "end" }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={employeeForm.canEditQuoteTerms}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    canEditQuoteTerms: e.target.checked,
                  }))
                }
              />
              Puede editar términos y condiciones
            </label>
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Firma en texto</label>
            <input
              value={employeeForm.signatureText}
              onChange={(e) =>
                setEmployeeForm((prev) => ({ ...prev, signatureText: e.target.value }))
              }
              placeholder="Ej. Alejandro Chi"
            />
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Firma en imagen (PNG o JPG, máximo 300 KB)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => handleEmployeeSignatureUpload(e.target.files?.[0] || null)}
            />
          </div>

          {employeeForm.signatureImage ? (
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Vista previa de firma</label>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #dbe4f0",
                  borderRadius: 12,
                  padding: 16,
                  display: "inline-block",
                }}
              >
                <img
                  src={employeeForm.signatureImage}
                  alt="Firma"
                  style={{ maxHeight: 100, maxWidth: 280, display: "block" }}
                />
              </div>
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-danger"
                  onClick={() =>
                    setEmployeeForm((prev) => ({
                      ...prev,
                      signatureImage: "",
                    }))
                  }
                >
                  Quitar firma
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={saveEmployee}>
            {editingEmployeeId ? "Guardar cambios" : "Agregar empleado"}
          </button>
          <button className="btn btn-secondary" onClick={resetEmployeeForm}>
            Cancelar
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Lista de empleados">
        <div className="search-box">
          <div className="field">
            <label>Buscar</label>
            <input
              value={employeeSearch}
              placeholder="Buscar por nombre, iniciales, cargo, email o rol"
              onChange={(e) => setEmployeeSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Iniciales</th>
                <th>Cargo</th>
                <th>Rol</th>
                <th>Permiso términos</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Firma texto</th>
                <th>Firma imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="empty-state">
                    Todavía no hay empleados registrados.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.fullName}</td>
                    <td>{employee.initials}</td>
                    <td>{employee.position}</td>
                    <td>{roleLabel(employee.role)}</td>
                    <td>{employee.canEditQuoteTerms ? "Sí" : "No"}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.signatureText}</td>
                    <td>
                      {employee.signatureImage ? (
                        <img
                          src={employee.signatureImage}
                          alt={`Firma de ${employee.fullName}`}
                          style={{
                            maxHeight: 42,
                            maxWidth: 120,
                            objectFit: "contain",
                            display: "block",
                            background: "#fff",
                            border: "1px solid #dbe4f0",
                            borderRadius: 8,
                            padding: 4,
                          }}
                        />
                      ) : (
                        "Sin firma"
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" onClick={() => editEmployee(employee)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-secondary btn-danger"
                          onClick={() => deleteEmployee(employee.id)}
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
