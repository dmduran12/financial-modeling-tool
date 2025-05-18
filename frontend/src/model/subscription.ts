export interface SubscriptionInput {
  projection_months: number;
  churn_rate_smb: number;
  tier_revenues: number[];
  initial_customers?: number;
  marketing_budget?: number;
  cpl?: number;
  conversion_rate?: number;
}

export interface SubscriptionResult {
  projections: {
    monthLabels: string[];
    customers_by_month: number[];
    mrr_by_month: number[];
    tier_revenue_by_month: number[][];
    tier_revenues_end: number[];
  };
  metrics: {
    total_mrr: number;
    total_customers: number;
    annual_revenue: number;
    customer_ltv: number;
    new_customers_monthly: number;
  };
}

export function runSubscriptionModel(input: SubscriptionInput): SubscriptionResult {
  const months = input.projection_months || 12;
  const churn = input.churn_rate_smb / 100;

  const monthlyAcquisition = input.marketing_budget && input.cpl && input.conversion_rate
    ? (input.marketing_budget / Math.max(input.cpl, 1)) * (input.conversion_rate / 100)
    : 0;

  const monthLabels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
  let customers = input.initial_customers || 10;
  const customers_by_month: number[] = [];
  const mrr_by_month: number[] = [];
  const tier_revenue_by_month: number[][] = input.tier_revenues.map(() => []);

  const avgRevenuePerCustomer =
    input.tier_revenues.reduce((sum, rev) => sum + rev, 0) /
    (input.tier_revenues.length || 1);

  for (let i = 0; i < months; i++) {
    customers = Math.max(0, customers * (1 - churn) + monthlyAcquisition);
    customers_by_month.push(Math.round(customers));
    const mrr = customers * avgRevenuePerCustomer;
    mrr_by_month.push(mrr);
    input.tier_revenues.forEach((rev, idx) => {
      tier_revenue_by_month[idx].push(customers * rev);
    });
  }

  return {
    projections: {
      monthLabels,
      customers_by_month,
      mrr_by_month,
      tier_revenue_by_month,
      tier_revenues_end: tier_revenue_by_month.map(arr => arr[arr.length - 1]),
    },
    metrics: {
      total_mrr: mrr_by_month[mrr_by_month.length - 1],
      total_customers: customers_by_month[customers_by_month.length - 1],
      annual_revenue: mrr_by_month[mrr_by_month.length - 1] * 12,
      customer_ltv: avgRevenuePerCustomer / (churn || 1),
      new_customers_monthly: Math.round(monthlyAcquisition),
    },
  };
}
