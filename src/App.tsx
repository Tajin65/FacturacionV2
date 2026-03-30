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
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dbe4f0",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div style={{ fontSize: 13, color: "#5b6b84", fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7a90", marginTop: 6 }}>{subtitle}</div>
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
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #dbe4f0",
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function PlaceholderTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  background: "#f4f7fb",
                  color: "#334155",
                  fontSize: 13,
                  borderBottom: "1px solid #dbe4f0",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cidx) => (
                <td
                  key={cidx}
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #e8eef6",
                    color: "#0f172a",
                    fontSize: 14,
                  }}
                >
                  {cell}
                </td>
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
      <div
        style={{
          border: "1px dashed #bfd0e4",
          background: "#f8fbff",
          borderRadius: 18,
          padding: 28,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{title}</div>
        <div style={{ marginTop: 8, color: "#5b6b84", maxWidth: 680 }}>{description}</div>
        <div
          style={{
            marginTop: 16,
            display: "inline-block",
            background: "#e8f0fb",
            color: "#123a72",
            padding: "8px 12px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Módulo en preparación
        </div>
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
          <div style={{ display: "grid", gap: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <StatCard title="Ventas cotizadas" value="$0.00" subtitle="Se activará con cotizaciones" />
              <StatCard title="Costo proveedor" value="$0.00" subtitle="Se alimentará con CFDI XML" />
              <StatCard title="Costo mano de obra" value="$0.00" subtitle="Instalaciones y cuadrillas" />
              <StatCard title="Utilidad estimada" value="$0.00" subtitle="Ventas - costos - mano de obra" />
            </div>

            <SectionCard title="Bienvenida">
              <div style={{ color: "#42546b", lineHeight: 1.65 }}>
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
    <div
      style={{
        minHeight: "100vh",
        background: "#eef4fb",
        color: "#0f172a",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          minHeight: "100vh",
        }}
      >
        <aside
          style={{
            background: "#0f2747",
            color: "#ffffff",
            padding: 24,
            borderRight: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              FacturacionV2
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "#bdd1ee", lineHeight: 1.5 }}>
              Sistema de cotizaciones, CFDI de proveedor, costos de instalación y reportes.
            </div>
          </div>

          <nav style={{ display: "grid", gap: 10 }}>
            {menuItems.map((item) => {
              const isActive = item.key === activeModule;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveModule(item.key)}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: isActive ? "1px solid #8cb5e8" : "1px solid rgba(255,255,255,0.08)",
                    background: isActive ? "#143760" : "transparent",
                    color: "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{item.label}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: isActive ? "#dce9fb" : "#b7c9e3" }}>
                    {item.description}
                  </div>
                </button>
              );
            })}
          </nav>

          <div
            style={{
              marginTop: 28,
              padding: 16,
              borderRadius: 18,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 12, color: "#d5e4f8", fontWeight: 700 }}>Estado del sistema</div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700 }}>Base desplegada en Railway</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#c0d4ef", lineHeight: 1.5 }}>
              Ya validamos deploy, dominio y render de React. Ahora seguimos con módulos paso por paso.
            </div>
          </div>
        </aside>

        <main style={{ padding: 28 }}>
          <div
            style={{
              marginBottom: 22,
              background: "#ffffff",
              border: "1px solid #dbe4f0",
              borderRadius: 20,
              padding: 22,
              boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div style={{ fontSize: 13, color: "#5b6b84", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Módulo actual
            </div>
            <h1 style={{ margin: "10px 0 6px", fontSize: 32, color: "#0f172a" }}>{activeItem.label}</h1>
            <div style={{ color: "#5b6b84", maxWidth: 900 }}>{activeItem.description}</div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
