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

export type EmployeeRole = "admin" | "sales" | "viewer";

export type Employee = {
  id: string;
  fullName: string;
  initials: string;
  position: string;
  email: string;
  phone: string;
  signatureText: string;
  signatureImage: string;
  role: EmployeeRole;
  canEditQuoteTerms: boolean;
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
  role: EmployeeRole;
  canEditQuoteTerms: boolean;
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

export type QuoteStatus = "abierta" | "en_proceso" | "cerrada" | "cancelada";

export type QuoteItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  isFreeItem?: boolean;
  freeItemName?: string;
  freeItemDescription?: string;
  itemType?: "producto" | "libre" | "mano_obra";
  perUnitDiscount?: number;
};

export type Quote = {
  id: string;
  folio: string;
  date: string;
  clientId: string;
  contactId: string;
  employeeId: string;
  projectName: string;
  currency: CurrencyCode;
  exchangeRate: number;
  notes: string;
  taxRatePercent: number;
  status: QuoteStatus;
  discountAmount: number;
  laborAmount: number;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
};

export type QuoteFormState = {
  id: string;
  folio: string;
  date: string;
  clientId: string;
  contactId: string;
  employeeId: string;
  projectName: string;
  currency: CurrencyCode;
  exchangeRateInput: string;
  notes: string;
  taxRatePercentInput: string;
  status: QuoteStatus;
  discountAmountInput: string;
  laborAmountInput: string;
};

export type AppSettings = {
  quoteTermsAndConditions: string;
};

export type CurrentSession = {
  employeeId: string;
};
