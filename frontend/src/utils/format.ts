export function formatNumberShort(value: number, decimals?: number): string {
  if (value >= 1_000_000) {
    const d = decimals ?? 2;
    return `${(value / 1_000_000).toFixed(d)}M`;
  } else if (value >= 1_000) {
    const d = decimals ?? 1;
    return `${(value / 1_000).toFixed(d)}K`;
  }
  return value.toLocaleString();
}

export function formatCurrency(value: number, decimals?: number): string {
  return '$' + formatNumberShort(value, decimals);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
