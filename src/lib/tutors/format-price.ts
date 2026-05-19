const FREE_LABEL = 'უფასო';

export function formatGelPrice(amount: number): string {
  if (amount === 0) return FREE_LABEL;
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${formatted} ₾`;
}
