import React, { useEffect, useMemo, useState } from "react";

type ModuleKey =
  | "dashboard"
  | "productos"
  | "empleados"
  | "clientes"
  | "contactos"
  | "cotizaciones"
  | "facturas"
  | "mano_obra"
  | "reportes";

type MenuItem = {
  key: ModuleKey;
  label: string;
  description: string;
};

type Product = {
  id: string;
  partNumber: string;
  shortName: string;
  brand: string;
  model: string;
  cost: number;
  marginPercent: number;
  salePrice: number;
  currency: "MXN" | "USD";
  description: string;
};

type ProductFormState = {
  id: string;
  partNumber: string;
  shortName: string;
  brand: string;
  model: string;
  costInput: string;
  marginInput: string;
  currency: "MXN" | "USD";
  description: string;
};

type Employee = {
  id: string;
  fullName: string;
  initials: string;
  position: string;
  email: string;
  phone: string;
  signatureText: string;
  signatureImage: string;
};

type EmployeeFormState = {
  id: string;
  fullName: string;
  initials: string;
  position: string;
  email: string;
  phone: string;
  signatureText: string;
  signatureImage: string;
};

const PRODUCTS_STORAGE_KEY = "facturacionv2_products_v1";
const EMPLOYEES_STORAGE_KEY = "facturacionv2_employees_v1";

const menuItems: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", description: "Resumen general del sistema" },
  { key: "productos", label: "Productos", description: "Catálogo y precios" },
  { key: "empleados", label: "Empleados", description: "Equipo y firmas" },
  { key: "clientes", label: "Clientes", description: "Base de clientes" },
  { key: "contactos", label: "Contactos por cliente", description: "Seguimiento comercial" },
  { key: "cotizaciones", label: "Cotizaciones", description: "Generación y seguimiento" },
  { key: "facturas", label: "Facturas proveedor", description: "CFDI XML y costos" },
  { key: "mano_obra", label: "Mano de obra", description: "Costo de instalación" },
  { key: "reportes", label: "Reportes", description: "Análisis y exportación" },
];

const blankProduct: ProductFormState = {
  id: "",
  partNumber: "",
  shortName: "",
  brand: "",
  model: "",
  costInput: "",
  marginInput: "",
  currency: "MXN",
  description: "",
};

const blankEmployee: EmployeeFormState = {
  id: "",
  fullName: "",
  initials: "",
  position: "",
  email: "",
  phone: "",
  signatureText: "",
  signatureImage: "",
};

function money(value: number, currency: "MXN" | "USD" = "MXN") {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="section-card">
      <div className="section-card-header">
        <h2 className="section-title">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function PlaceholderTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap">
      <table className="app-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cidx) => (
                <td key={cidx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyModule({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SectionCard title={title}>
      <div className="placeholder-box">
        <div className="placeholder-title">{title}</div>
        <div className="placeholder-text">{description}</div>
        <div className="placeholder-badge">Módulo en preparación</div>
      </div>
    </SectionCard>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");

  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState<ProductFormState>(blankProduct);
  const [editingProductId, setEditingProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>(blankEmployee);
  const [editingEmployeeId, setEditingEmployeeId] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!saved) return;
    try {
      setProducts(JSON.parse(saved));
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

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

  const activeItem = useMemo(
    () => menuItems.find((item) => item.key === activeModule) ?? menuItems[0],
    [activeModule]
  );

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) =>
      [product.partNumber, product.shortName, product.brand, product.model, product.description]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [products, productSearch]);

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
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [employees, employeeSearch]);

  const productCostNumber = useMemo(
    () => Number(productForm.costInput || 0),
    [productForm.costInput]
  );

  const productMarginNumber = useMemo(
    () => Number(productForm.marginInput || 0),
    [productForm.marginInput]
  );

  const productSalePrice = useMemo(() => {
    if (!productCostNumber) return 0;
    const marginDecimal = productMarginNumber / 100;
    if (marginDecimal >= 1) return 0;
    return productCostNumber / (1 - marginDecimal);
  }, [productCostNumber, productMarginNumber]);

  function resetProductForm() {
    setProductForm(blankProduct);
    setEditingProductId("");
  }

  function saveProduct() {
    if (!productForm.partNumber.trim() || !productForm.shortName.trim()) {
      alert("Captura al menos número de parte y nombre corto.");
      return;
    }

    if (Number(productForm.marginInput || 0) >= 100) {
      alert("El margen de ganancia debe ser menor a 100%.");
      return;
    }

    const payload: Product = {
      id: editingProductId || crypto.randomUUID(),
      partNumber: productForm.partNumber.trim(),
      shortName: productForm.shortName.trim(),
      brand: productForm.brand.trim(),
      model: productForm.model.trim(),
      cost: Number(productForm.costInput || 0),
      marginPercent: Number(productForm.marginInput || 0),
      salePrice: productSalePrice,
      currency: productForm.currency,
      description: productForm.description.trim(),
    };

    if (editingProductId) {
      setProducts((prev) =>
        prev.map((item) => (item.id === editingProductId ? payload : item))
      );
    } else {
      setProducts((prev) => [...prev, payload]);
    }

    resetProductForm();
  }

  function editProduct(product: Product) {
    setProductForm({
      id: product.id,
      partNumber: product.partNumber,
      shortName: product.shortName,
      brand: product.brand,
      model: product.model,
      costInput: String(product.cost),
      marginInput: String(product.marginPercent),
      currency: product.currency,
      description: product.description,
    });
    setEditingProductId(product.id);
    setActiveModule("productos");
  }

  function deleteProduct(id: string) {
    const confirmed = window.confirm("¿Deseas eliminar este producto?");
    if (!confirmed) return;
    setProducts((prev) => prev.filter((item) => item.id !== id));
    if (editingProductId === id) resetProductForm();
  }

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
});
    setEditingEmployeeId(employee.id);
    setActiveModule("empleados");
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
  
  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return (
          <div className="content-stack">
            <div className="stats-grid">
              <StatCard title="Ventas cotizadas" value="$0.00" subtitle="Se activará con cotizaciones" />
              <StatCard title="Costo proveedor" value="$0.00" subtitle="Se alimentará con CFDI XML" />
              <StatCard title="Costo mano de obra" value="$0.00" subtitle="Instalaciones y cuadrillas" />
              <StatCard title="Utilidad estimada" value="$0.00" subtitle="Ventas - costos - mano de obra" />
            </div>

            <SectionCard title="Bienvenida">
              <div className="section-text">
                FacturacionV2 ya está corriendo en Railway y ahora esta base ya está lista para
                convertirse en un sistema más completo. Vamos a construirlo por módulos, empezando por
                la interfaz y después los CRUDs, cotizaciones, CFDI y mano de obra.
              </div>
            </SectionCard>

            <SectionCard title="Próximos módulos">
              <PlaceholderTable
                columns={["Módulo", "Objetivo", "Estado"]}
                rows={[
                  ["Productos", "Catálogo, costo, margen y precio de venta", "En progreso"],
                  ["Empleados", "Equipo y firmas", "En progreso"],
                  ["Clientes", "Base comercial", "Pendiente"],
                  ["Contactos", "Contactos por cliente", "Pendiente"],
                  ["Cotizaciones", "Generación y partidas", "Pendiente"],
                  ["Facturas proveedor", "Carga CFDI y match", "Pendiente"],
                  ["Mano de obra", "Costo de instalación", "Pendiente"],
                ]}
              />
            </SectionCard>
          </div>
        );

      case "productos":
        return (
          <div className="content-stack">
            <SectionCard
              title={editingProductId ? "Editar producto" : "Alta de producto"}
              right={
                <button className="btn btn-secondary" onClick={resetProductForm}>
                  Limpiar
                </button>
              }
            >
              <div className="form-grid">
                <div className="field">
                  <label>Número de parte</label>
                  <input
                    value={productForm.partNumber}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, partNumber: e.target.value }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Nombre corto</label>
                  <input
                    value={productForm.shortName}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, shortName: e.target.value }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Marca</label>
                  <input
                    value={productForm.brand}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, brand: e.target.value }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Modelo</label>
                  <input
                    value={productForm.model}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, model: e.target.value }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Moneda</label>
                  <select
                    value={productForm.currency}
                    onChange={(e) =>
                      setProductForm((prev) => ({
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
                  <label>Costo</label>
                  <input
                    type="number"
                    value={productForm.costInput}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, costInput: e.target.value }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Margen de ganancia %</label>
                  <input
                    type="number"
                    value={productForm.marginInput}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, marginInput: e.target.value }))
                    }
                  />
                </div>

                <div className="info-box">
                  <div className="info-box-label">Precio de venta</div>
                  <div className="info-box-value">
                    {money(productSalePrice, productForm.currency)}
                  </div>
                </div>

                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label>Descripción</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="button-row">
                <button className="btn btn-primary" onClick={saveProduct}>
                  {editingProductId ? "Guardar cambios" : "Agregar producto"}
                </button>
                <button className="btn btn-secondary" onClick={resetProductForm}>
                  Cancelar
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Catálogo de productos">
              <div className="search-box">
                <div className="field">
                  <label>Buscar</label>
                  <input
                    value={productSearch}
                    placeholder="Buscar por parte, nombre, marca o modelo"
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrap">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>No. parte</th>
                      <th>Nombre</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Costo</th>
                      <th>Margen %</th>
                      <th>Precio de venta</th>
                      <th>Moneda</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="empty-state">
                          Todavía no hay productos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.partNumber}</td>
                          <td>{product.shortName}</td>
                          <td>{product.brand}</td>
                          <td>{product.model}</td>
                          <td>{money(product.cost, product.currency)}</td>
                          <td>{product.marginPercent.toFixed(2)}%</td>
                          <td>{money(product.salePrice, product.currency)}</td>
                          <td>{product.currency}</td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn-secondary" onClick={() => editProduct(product)}>
                                Editar
                              </button>
                              <button
                                className="btn btn-secondary btn-danger"
                                onClick={() => deleteProduct(product.id)}
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

      case "empleados":
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
  <label>Firma en imagen (PNG o JPG)</label>
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
                    placeholder="Buscar por nombre, iniciales, cargo o email"
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
                        <td colSpan={8} className="empty-state">
                          Todavía no hay empleados registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.fullName}</td>
                          <td>{employee.initials}</td>
                          <td>{employee.position}</td>
                          <td>{employee.email}</td>
                          <td>{employee.phone}</td>
                          <td>{employee.signatureText}</td>
                          <td>{employee.signatureImage ? "Sí" : "No"}</td>
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

      case "clientes":
        return (
          <EmptyModule
            title="Clientes"
            description="Aquí construiremos la base de clientes con dirección, correo, crédito y notas, lista para enlazarse con cotizaciones, contactos y facturas."
          />
        );

      case "contactos":
        return (
          <EmptyModule
            title="Contactos"
            description="Este módulo administrará contactos asociados a clientes, con puesto, email, teléfono y notas para dar seguimiento comercial."
          />
        );

      case "cotizaciones":
        return (
          <EmptyModule
            title="Cotizaciones"
            description="Aquí irá el generador de cotizaciones con tipo de cambio, moneda MXN/USD, partidas, subtotal, IVA, total y vista previa."
          />
        );

      case "facturas":
        return (
          <EmptyModule
            title="Facturas proveedor"
            description="En este módulo cargaremos XML CFDI de proveedor, extraeremos conceptos y prepararemos el match automático contra partidas de una cotización."
          />
        );

      case "mano_obra":
        return (
          <EmptyModule
            title="Mano de obra"
            description="Aquí construiremos el cálculo del costo de instalación considerando salario técnico, supervisor, IMSS/cargas sociales, viáticos, transporte, herramientas, EPP, renta de equipo, ingeniería, indirectos y utilidad."
          />
        );

      case "reportes":
        return (
          <EmptyModule
            title="Reportes"
            description="Este módulo mostrará indicadores, utilidad estimada, costos por proveedor, mano de obra y exportaciones para análisis."
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <div className="app-grid">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-title">FacturacionV2</div>
            <div className="sidebar-subtitle">
              Sistema de cotizaciones, CFDI de proveedor, costos de instalación y reportes.
            </div>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const isActive = item.key === activeModule;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveModule(item.key)}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  <div className="sidebar-link-title">{item.label}</div>
                  <div className="sidebar-link-description">{item.description}</div>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-status">
            <div className="sidebar-status-kicker">Estado del sistema</div>
            <div className="sidebar-status-title">Base desplegada en Railway</div>
            <div className="sidebar-status-text">
              Ya validamos deploy, dominio y render de React. Ahora seguimos con módulos paso por paso.
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="page-header-card">
            <div className="page-kicker">Módulo actual</div>
            <h1 className="page-title">{activeItem.label}</h1>
            <div className="page-description">{activeItem.description}</div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
