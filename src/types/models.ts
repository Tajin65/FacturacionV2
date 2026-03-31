export type ModuleKey =
  | "dashboard"
  | "productos"
  | "empleados"
  | "clientes"
  | "contactos"
  | "cotizaciones"
  | "facturas"
  | "mano_obra"
  | "reportes";

export type MenuItem = {
  key: ModuleKey;
  label: string;
  description: string;
};

export type CurrencyCode = "MXN" | "USD";

export type Product = {
  id: string;
  partNumber: string;
  shortName: string;
  brand: string;
  model: string;
  cost: number;
  marginPercent: number;
  salePrice: number;
  currency: CurrencyCode;
  description: string;
};

export type ProductFormState = {
  id: string;
  partNumber: string;
  shortName: string;
  brand: string;
  model: string;
  costInput: string;
  marginInput: string;
  currency: CurrencyCode;
  description: string;
};

export type Employee = {
  id: string;
  fullName: string;
  initials: string;
  position: string;
  email: string;
  phone: string;
  signatureText: string;
  signatureImage: string;
};

export type EmployeeFormState = {
  id: string;
  fullName: string;
  initials: string;
  position: string;
  email: string;
  phone: string;
  signatureText: string;
  signatureImage: string;
};

export type Client = {
  id: string;
  businessName: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  creditDays: number;
  notes: string;
};

export type ClientFormState = {
  id: string;
  businessName: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  creditDaysInput: string;
  notes: string;
};

export type Contact = {
  id: string;
  clientId: string;
  fullName: string;
  position: string;
  email: string;
  phone: string;
  notes: string;
};

export type ContactFormState = {
  id: string;
  clientId: string;
  fullName: string;
  position: string;
  email: string;
  phone: string;
  notes: string;
};
