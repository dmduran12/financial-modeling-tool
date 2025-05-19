import { formatCurrency, formatPercentage, formatNumberShort } from './format';

test('format currency millions', () => {
  expect(formatCurrency(1270000)).toBe('1.27M');
});

test('format currency thousands', () => {
  expect(formatCurrency(7900)).toBe('7.9K');
});

test('format currency small', () => {
  expect(formatCurrency(500)).toBe('500');
});

test('custom decimals', () => {
  expect(formatCurrency(1500000, 0)).toBe('2M');
});

test('percentage tolerance', () => {
  const val = 0.1234;
  const pct = parseFloat(formatPercentage(val));
  expect(Math.abs(pct - 12.34)).toBeLessThanOrEqual(12.34 * 0.005);
});
