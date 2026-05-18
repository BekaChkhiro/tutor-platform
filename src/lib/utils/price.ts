const GEL_FORMATTER = new Intl.NumberFormat('en-US');

export function formatGelPrice(amount: number): string {
  if (amount === 0) return 'უფასო';
  return `${GEL_FORMATTER.format(amount)} ₾`;
}
