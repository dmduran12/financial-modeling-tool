export function calculateFinancialMetrics(
  modelResults,
  initialInvestment,
  expenses,
  wacc,
) {
  const grossProfits = modelResults.projections.mrr_by_month.map((mrr) => {
    return mrr * (1 - expenses.operatingExpenseRate / 100);
  });

  const monthlyMarketing = expenses.marketingSpend || 0;
  let remainingInvestment = initialInvestment;

  const cashFlows = grossProfits.map((gp) => {
    const covered = Math.min(remainingInvestment, monthlyMarketing);
    remainingInvestment -= covered;
    return gp - expenses.fixedCosts - (monthlyMarketing - covered);
  });

  const waccMonthly = Math.pow(1 + wacc / 100, 1 / 12) - 1;

  const npv = cashFlows.reduce((acc, cf, idx) => {
    return acc + cf / Math.pow(1 + waccMonthly, idx + 1);
  }, -initialInvestment);

  let cumulative = -initialInvestment;
  let paybackMonths = null;
  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative > 0) {
      paybackMonths = i + 1;
      break;
    }
  }

  return { npv, paybackMonths, cashFlows };
}
