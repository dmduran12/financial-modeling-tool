export function calculateFinancialMetrics(modelResults, initialInvestment, expenses, wacc) {
  const cashFlows = modelResults.projections.mrr_by_month.map((mrr) => {
    const operatingExpense = (expenses.operatingExpenseRate / 100) * mrr;
    const fixedCosts = expenses.fixedCosts;
    return mrr - operatingExpense - fixedCosts;
  });

  const npv = cashFlows.reduce((acc, cf, idx) => {
    return acc + cf / Math.pow(1 + wacc / 100, idx + 1);
  }, -initialInvestment);

  let cumulative = -initialInvestment;
  let paybackMonths = null;
  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative > 0) { paybackMonths = i + 1; break; }
  }

  return { npv, paybackMonths };
}
