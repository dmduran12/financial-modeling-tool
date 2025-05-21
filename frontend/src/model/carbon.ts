export function deriveCarbonPerCustomer(
  tierPrices: number[],
  costPerTon: number,
  highMargin = 1.5,
  lowMargin = 1.1,
): number[] {
  if (tierPrices.length === 0 || costPerTon <= 0) {
    return [];
  }
  const n = tierPrices.length;
  const startLn = Math.log(highMargin);
  const endLn = Math.log(lowMargin);
  return tierPrices.map((price, idx) => {
    const ratio = n === 1 ? 0 : idx / (n - 1);
    const lnFactor = startLn + (endLn - startLn) * ratio;
    const factor = Math.exp(lnFactor);
    const tons = (price / costPerTon) * factor;
    return Math.round(tons);
  });
}
