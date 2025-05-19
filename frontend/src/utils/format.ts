export function formatNumberShort(value: number, decimals = 0): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const d = decimals || 2;
    const num = (value / 1_000_000).toFixed(d);
    return parseFloat(num).toString() + 'M';
  } else if (abs >= 1_000) {
    const num = (value / 1_000)
      .toPrecision(2)
      .replace(/\.0$/, '');
    return num + 'K';
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
