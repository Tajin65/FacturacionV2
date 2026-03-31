export function calculateSalePriceFromMargin(cost: number, marginPercent: number) {
  if (!cost) return 0;
  const marginDecimal = marginPercent / 100;
  if (marginDecimal >= 1) return 0;
  return cost / (1 - marginDecimal);
}

export function calculateQuoteLineSubtotal(quantity: number, unitPrice: number) {
  return Number(quantity || 0) * Number(unitPrice || 0);
}

export function calculateQuoteSubtotal(items: Array<{ quantity: number; unitPrice: number }>) {
  return items.reduce((sum, item) => sum + calculateQuoteLineSubtotal(item.quantity, item.unitPrice), 0);
}

export function calculateQuoteTax(subtotal: number, taxRatePercent: number) {
  return subtotal * (Number(taxRatePercent || 0) / 100);
}

export function calculateQuoteTotal(subtotal: number, taxRatePercent: number) {
  return subtotal + calculateQuoteTax(subtotal, taxRatePercent);
}
