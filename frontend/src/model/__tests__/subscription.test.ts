import { runSubscriptionModel } from "../subscription";
import { blendSeasonality } from "../../utils/seasonality";
import { DEFAULT_SEASONALITY } from "../constants";

test("customer roll-forward logic", () => {
  const result = runSubscriptionModel({
    projection_months: 2,
    churn_rate_smb: 10,
    tier_revenues: [100],
    initial_customers: 100,
    marketing_budget: 1000,
    conversion_rate: 10,
    ctr: 18,
  });
  expect(result.projections.customers_by_month[0]).toBeCloseTo(90.521875);
  expect(result.projections.customers_by_month[1]).toBeCloseTo(81.9915625);
});

test("MRR matches sum of tier revenues", () => {
  const res = runSubscriptionModel({
    projection_months: 3,
    churn_rate_smb: 5,
    tier_revenues: [50, 150],
    initial_customers: 20,
    marketing_budget: 1000,
    conversion_rate: 10,
    ctr: 18,
  });
  res.projections.mrr_by_month.forEach((mrr, idx) => {
    const sumTiers = res.projections.tier_revenue_by_month.reduce(
      (a, arr) => a + arr[idx],
      0,
    );
    expect(sumTiers).toBeCloseTo(mrr);
  });
});

test("zero marketing spend yields zero new customers", () => {
  const res = runSubscriptionModel({
    projection_months: 1,
    churn_rate_smb: 5,
    tier_revenues: [100],
    initial_customers: 0,
    marketing_budget: 0,
    conversion_rate: 0,
    ctr: 18,
  });
  expect(res.projections.new_customers_by_month[0]).toBe(0);
  expect(res.projections.customers_by_month[0]).toBe(0);
});

test("seasonality influence never increases MRR", () => {
  const input = {
    projection_months: 12,
    churn_rate_smb: 5,
    tier_revenues: [100],
    initial_customers: 100,
    marketing_budget: 1000,
    conversion_rate: 10,
    ctr: 18,
  };
  const baseline = runSubscriptionModel(input);
  const blend = blendSeasonality(DEFAULT_SEASONALITY, 100);
  const withSeasonality = runSubscriptionModel(input, blend);
  withSeasonality.projections.mrr_by_month.forEach((mrr, idx) => {
    expect(mrr).toBeLessThanOrEqual(baseline.projections.mrr_by_month[idx]);
  });
});
