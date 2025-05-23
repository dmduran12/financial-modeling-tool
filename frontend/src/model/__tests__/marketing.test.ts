import { calculateTierMetrics } from "../marketing";

test("sum of new customers equals total", () => {
  const res = calculateTierMetrics(4, 10000, 18, 8);
  const sum = res.newCustomers.reduce((a, b) => a + b, 0);
  expect(sum).toBeCloseTo(res.totalNewCustomers);
});
