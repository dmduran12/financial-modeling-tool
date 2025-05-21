import { SubscriptionResult } from "./subscription";

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
  wacc: number,
) {
  const cashFlows = modelResults.projections.free_cash_flow;

  const months = cashFlows.length;
  const waccMonthly = Math.pow(1 + wacc / 100, 1 / 12) - 1;
  const monthlyInvestmentPortion = initialInvestment / months;
  const financingCost = initialInvestment * waccMonthly;
  const adjustedFlows = cashFlows.map(
    (cf) => cf - monthlyInvestmentPortion - financingCost,
  );

  const npv = adjustedFlows.reduce((acc, cf, idx) => {
    return acc + cf / Math.pow(1 + waccMonthly, idx + 1);
  }, 0);

  let cumulative = 0;
  let paybackMonths: number | null = null;
  for (let i = 0; i < adjustedFlows.length; i++) {
    cumulative += adjustedFlows[i];
    if (cumulative > 0) {
      paybackMonths = i + 1;
      break;
    }
  }

  return { npv, paybackMonths, cashFlows: adjustedFlows };
}
