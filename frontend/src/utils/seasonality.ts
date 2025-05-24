export function blendSeasonality(
  seasonality: number[],
  sliderValue: number,
): number[] {
  const len = seasonality.length;
  const uniform = Array(len).fill(1 / len);
  const s = sliderValue / 100;
  const raw = seasonality.map(
    (val, i) => Math.pow(uniform[i], 1 - s) * Math.pow(val, s),
  );
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / total);
}
