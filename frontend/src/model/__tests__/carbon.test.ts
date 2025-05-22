import { deriveCarbonPerCustomer } from "../carbon";

test("derive carbon tons logarithmically between margins", () => {
  const res = deriveCarbonPerCustomer([100, 200, 300, 400], 10);
  expect(res).toEqual([7, 15, 25, 36]);
});
