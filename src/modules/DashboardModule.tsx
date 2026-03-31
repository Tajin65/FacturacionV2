import React from "react";
import { StatCard } from "../components/StatCard";
import { SectionCard } from "../components/SectionCard";
import { PlaceholderTable } from "../components/PlaceholderTable";

export default function DashboardModule() {
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
          FacturacionV2 ya está corriendo en Railway y esta base está lista para seguir creciendo por módulos.
        </div>
      </SectionCard>

      <SectionCard title="Próximos módulos">
        <PlaceholderTable
          columns={["Módulo", "Objetivo", "Estado"]}
          rows={[
            ["Productos", "Catálogo, costo, margen y precio de venta", "En progreso"],
            ["Empleados", "Equipo y firmas", "En progreso"],
            ["Clientes", "Base comercial", "En progreso"],
            ["Contactos", "Contactos por cliente", "En progreso"],
            ["Cotizaciones", "Generación y partidas", "Pendiente"],
          ]}
        />
      </SectionCard>
    </div>
  );
}
