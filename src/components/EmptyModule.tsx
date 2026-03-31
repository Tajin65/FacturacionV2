import React from "react";
import { SectionCard } from "./SectionCard";

export function EmptyModule({
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
