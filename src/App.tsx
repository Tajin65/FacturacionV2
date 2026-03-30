import React, { useMemo, useState } from "react";

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

const menuItems: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", description: "Resumen general del sistema" },
  { key: "productos", label: "Productos", description: "Catálogo y precios" },
  { key: "empleados", label: "Empleados", description: "Equipo y firmas" },
  { key: "clientes", label: "Clientes", description: "Base de clientes" },
  { key: "contactos", label: "Contactos", description: "Contactos por cliente" },
  { key: "cotizaciones", label: "Cotizaciones", description: "Generación y seguimiento" },
  { key: "facturas", label: "Facturas proveedor", description: "CFDI XML y costos" },
  { key: "mano_obra", label: "Mano de obra", description: "Costo de instalación" },
  { key: "reportes", label: "Reportes", description: "Análisis y exportación" },
];

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

  const activeItem = useMemo(
    () => menuItems.find((item) => item.key === activeModule) ?? menuItems[0],
    [activeModule]
  );

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
                  ["Productos", "Catálogo, costo, precio y moneda", "Siguiente"],
                  ["Empleados", "Vendedores, firmas y datos", "Pendiente"],
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
          <EmptyModule
            title="Productos"
            description="Aquí construiremos el catálogo de productos con número de parte, marca, modelo, costo, precio, moneda y descripción. También dejaremos lista la base para usar los productos dentro de cotizaciones."
          />
        );

      case "empleados":
        return (
          <EmptyModule
            title="Empleados"
            description="Este módulo permitirá registrar vendedores y personal interno, incluyendo nombre, iniciales, puesto, email, teléfono y firma para cotizaciones."
          />
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
