export function runSubscriptionModel(input) {
  const months = input.projection_months || 12;
  const churn = input.churn_rate_smb / 100;
  const growth = 0.05; // simple monthly growth assumption

  const monthLabels = Array.from({ length: months }, (_, i) => `M${i+1}`);
  let customers = input.initial_customers || 10;
  const customers_by_month = [];
  const mrr_by_month = [];

  for (let i=0; i<months; i++) {
    customers = Math.max(0, customers * (1 + growth - churn));
    customers_by_month.push(Math.round(customers));
    const mrr = input.tier_revenues.reduce((sum, rev) => sum + rev, 0);
    mrr_by_month.push(mrr);
  }

  return {
    projections: {
      monthLabels,
      customers_by_month,
      mrr_by_month,
      tier_revenues_end: input.tier_revenues
    },
    metrics: {
      total_mrr: mrr_by_month[mrr_by_month.length-1],
      total_customers: customers_by_month[customers_by_month.length-1],
      annual_revenue: mrr_by_month[mrr_by_month.length-1] * 12,
      customer_ltv: mrr_by_month[mrr_by_month.length-1] / (churn || 1),
      new_customers_monthly: customers_by_month[1] - (input.initial_customers || 10)
    }
  };
}
