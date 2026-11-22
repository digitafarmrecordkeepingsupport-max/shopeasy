/**
 * Formats a numeric value into Nigerian Naira (₦) representation.
 * Examples:
 *   formatNaira(25000) => "₦25,000"
 *   formatNaira(45000.5) => "₦45,000"
 */
export function formatNaira(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₦0';
  }
  const numeric = Math.round(Number(amount));
  return '₦' + numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculates discount percentage between original price and current price.
 */
export function calculateDiscountPercent(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
