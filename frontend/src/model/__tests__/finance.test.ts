import { runSubscriptionModel } from '../subscription';
import { calculateFinancialMetrics } from '../finance';

test('cash flows non-negative with profitable model', () => {
  const sub = runSubscriptionModel({
    projection_months: 3,
    churn_rate_smb: 2,
    tier_revenues: [200],
    initial_customers: 50,
    marketing_budget: 0,
    cpl: 100,
    conversion_rate: 0,
    operating_expense_rate: 10,
    fixed_costs: 0,
  });
  const fin = calculateFinancialMetrics(sub, 0, {operatingExpenseRate: 10, fixedCosts: 0, marketingSpend:0}, 5);
  expect(fin.cashFlows.every(cf => cf >= 0)).toBe(true);
});
