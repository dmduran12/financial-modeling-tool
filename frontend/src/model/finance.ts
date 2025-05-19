import { SubscriptionResult } from './subscription';

export interface Expenses {
  operatingExpenseRate: number;
  fixedCosts: number;
  marketingSpend?: number;
  co2UnitCost?: number;
  co2EmissionsPerCustomer?: number;
  customerServiceCostPerCustomer?: number;
}

export function calculateFinancialMetrics(
  modelResults: SubscriptionResult,
  initialInvestment: number,
  expenses: Expenses,
  wacc: number
) {
  const grossProfits = modelResults.projections.mrr_by_month.map((mrr) => {
    return mrr * (1 - expenses.operatingExpenseRate / 100);
  });

  const monthlyMarketing = expenses.marketingSpend || 0;

  const cashFlows = grossProfits.map((gp) => {
    return gp - expenses.fixedCosts - monthlyMarketing;
  });

  const waccMonthly = Math.pow(1 + wacc / 100, 1 / 12) - 1;

  const npv = cashFlows.reduce((acc, cf, idx) => {
    return acc + cf / Math.pow(1 + waccMonthly, idx + 1);
  }, -initialInvestment);

  let cumulative = -initialInvestment;
  let paybackMonths: number | null = null;
  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative > 0) { paybackMonths = i + 1; break; }
  }

  return { npv, paybackMonths, cashFlows };
}
