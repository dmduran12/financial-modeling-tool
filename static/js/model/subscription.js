export function runSubscriptionModel(input) {
  const months = input.projection_months || 12;
  const churn = input.churn_rate_smb / 100;
  const conversion = (input.conversion_rate || 0) / 100;

  const monthlyAcquisition = input.marketing_budget && input.cpl && input.conversion_rate
    ? Math.max(0, (input.marketing_budget / Math.max(input.cpl, 1)) * conversion)
    : 0;

  const monthLabels = Array.from({ length: months }, (_, i) => `M${i+1}`);
  let customers = input.initial_customers || 10;
  const customers_by_month = [];
  const mrr_by_month = [];
  const deferred_by_month = [];
  
  const avgRevenuePerCustomer =
    input.tier_revenues.reduce((sum, rev) => sum + rev, 0) /
    (input.tier_revenues.length || 1);

  for (let i=0; i<months; i++) {
    const churned = Math.min(customers, customers * churn);
    customers = Math.max(0, customers + monthlyAcquisition - churned);
    customers_by_month.push(Math.round(customers));
    const recognized = customers * avgRevenuePerCustomer;
    mrr_by_month.push(recognized);
    deferred_by_month.push(recognized);
  }

  return {
    projections: {
      monthLabels,
      customers_by_month,
      mrr_by_month,
      tier_revenues_end: input.tier_revenues,
      deferred_revenue_by_month: deferred_by_month
    },
    metrics: {
      total_mrr: mrr_by_month[mrr_by_month.length-1],
      total_subscribers: customers_by_month[customers_by_month.length-1],
      annual_revenue: mrr_by_month.slice(0,12).reduce((a,b)=>a+b,0),
      subscriber_ltv:
        (avgRevenuePerCustomer * (1 - (input.operating_expense_rate||0)/100)) /
        (churn || 1),
      new_subscribers_monthly: monthlyAcquisition
    }
  };
}
