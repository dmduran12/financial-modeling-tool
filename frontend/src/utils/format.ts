export function formatNumberShort(value: number, decimals = 0): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return (
      (value / 1_000_000)
        .toFixed(2)
        .replace(/\.0+$/, '') + 'M'
    );
  }
  if (abs >= 1_000) {
    return (
      (value / 1_000)
        .toFixed(1)
        .replace(/\.0$/, '') + 'K'
    );
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

export function formatCurrency(value: number, decimals?: number): string {
  return formatNumberShort(value, decimals);
}

export function formatPercentage(value: number): string {
  const pct = (value * 100).toFixed(1).replace(/\.0$/, '');
  return pct;
}
