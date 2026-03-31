import React, { useMemo, useState } from "react";
import DashboardModule from "./modules/DashboardModule";
import ProductsModule from "./modules/ProductsModule";
import EmployeesModule from "./modules/EmployeesModule";
import ClientsModule from "./modules/ClientsModule";
import ContactsModule from "./modules/ContactsModule";
import QuotesModule from "./modules/QuotesModule";
import { EmptyModule } from "./components/EmptyModule";
import type { MenuItem, ModuleKey } from "./types/models";

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

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");

  const activeItem = useMemo(
    () => menuItems.find((item) => item.key === activeModule) ?? menuItems[0],
    [activeModule]
  );

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardModule />;

      case "productos":
        return <ProductsModule />;

      case "empleados":
        return <EmployeesModule />;

      case "clientes":
        return <ClientsModule />;

      case "contactos":
        return <ContactsModule />;

      case "cotizaciones":
        return <QuotesModule />;

      case "facturas":
        return (
          <EmptyModule
            title="Facturas proveedor"
            description="Aquí construiremos el módulo de CFDI XML de proveedor y el match contra cotizaciones."
          />
        );

      case "mano_obra":
        return (
          <EmptyModule
            title="Mano de obra"
            description="Aquí construiremos el cálculo de mano de obra, viáticos, transporte, herramientas, indirectos y utilidad."
          />
        );

      case "reportes":
        return (
          <EmptyModule
            title="Reportes"
            description="Aquí construiremos los reportes de ventas, costos, utilidad y exportaciones."
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
              La interfaz ya está modularizada y lista para seguir creciendo sin saturar App.tsx.
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="page-header-card">
            <div className="page-kicker">Módulo actual</div>
            <h1 className="page-title">{activeItem.label}</h1>
            <div className="page-description">{activeItem.description}</div>
          </div>

          {renderModule()}
        </main>
      </div>
    </div>
  );
}
