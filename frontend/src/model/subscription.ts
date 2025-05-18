export interface SubscriptionInput {
  projection_months: number;
  churn_rate_smb: number;
  tier_revenues: number[];
  initial_customers?: number;
}

export interface SubscriptionResult {
  projections: {
    monthLabels: string[];
    customers_by_month: number[];
    mrr_by_month: number[];
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
  const growth = 0.05;

  const monthLabels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
  let customers = input.initial_customers || 10;
  const customers_by_month: number[] = [];
  const mrr_by_month: number[] = [];

  for (let i = 0; i < months; i++) {
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
      tier_revenues_end: input.tier_revenues,
    },
    metrics: {
      total_mrr: mrr_by_month[mrr_by_month.length - 1],
      total_customers: customers_by_month[customers_by_month.length - 1],
      annual_revenue: mrr_by_month[mrr_by_month.length - 1] * 12,
      customer_ltv: mrr_by_month[mrr_by_month.length - 1] / (churn || 1),
      new_customers_monthly:
        customers_by_month[1] - (input.initial_customers || 10),
    },
  };
}
