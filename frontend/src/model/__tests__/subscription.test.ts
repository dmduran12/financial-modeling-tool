import { runSubscriptionModel } from '../subscription';

test('customer roll-forward logic', () => {
  const result = runSubscriptionModel({
    projection_months: 2,
    churn_rate_smb: 10,
    tier_revenues: [100],
    initial_customers: 100,
    marketing_budget: 1000,
    cpl: 100,
    conversion_rate: 10,
  });
  expect(result.projections.customers_by_month[0]).toBeCloseTo(90.521875);
  expect(result.projections.customers_by_month[1]).toBeCloseTo(81.9915625);
});

test('MRR matches sum of tier revenues', () => {
  const res = runSubscriptionModel({
    projection_months: 3,
    churn_rate_smb: 5,
    tier_revenues: [50, 150],
    initial_customers: 20,
    marketing_budget: 1000,
    cpl: 100,
    conversion_rate: 10,
  });
  res.projections.mrr_by_month.forEach((mrr, idx) => {
    const sumTiers = res.projections.tier_revenue_by_month.reduce((a, arr) => a + arr[idx], 0);
    expect(sumTiers).toBeCloseTo(mrr);
  });
});
