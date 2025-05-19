export function formatNumberShort(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)} k`;
  }
  return value.toLocaleString();
}

export function formatCurrency(value: number): string {
  return '$' + formatNumberShort(value);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)} %`;
}
