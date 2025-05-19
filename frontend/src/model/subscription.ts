import { calculateTierMetrics } from "./marketing";
export interface SubscriptionInput {
  projection_months: number;
  churn_rate_smb: number;
  tier_revenues: number[];
  initial_customers?: number;
  marketing_budget?: number;
  cpl?: number;
  conversion_rate?: number;
  operating_expense_rate?: number;
  fixed_costs?: number;
  tier_adoption_rates?: number[];
}

export interface SubscriptionResult {
  projections: {
    monthLabels: string[];
    customers_by_month: number[];
    mrr_by_month: number[];
    tier_revenues_end: number[];
    tier_revenue_by_month: number[][];
    deferred_revenue_by_month: number[];
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
    ? calculateTierMetrics(input.cpl, input.conversion_rate, input.marketing_budget).totalNewCustomers
    : 0;

  const adoption =
    input.tier_adoption_rates &&
    input.tier_adoption_rates.length === input.tier_revenues.length
      ? input.tier_adoption_rates.slice()
      : Array(input.tier_revenues.length).fill(1 / (input.tier_revenues.length || 1));
  const totalRate = adoption.reduce((a, b) => a + b, 0) || 1;
  const normalizedAdoption = adoption.map((r) => r / totalRate);

  const monthLabels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
  let customers = input.initial_customers || 10;
  const customers_by_month: number[] = [];
  const mrr_by_month: number[] = [];
  const deferred_by_month: number[] = [];
  const tier_revenue_by_month: number[][] = Array.from(
    { length: input.tier_revenues.length },
    () => [] as number[]
  );

  const avgRevenuePerCustomer = input.tier_revenues.reduce(
    (sum, rev, idx) => sum + rev * normalizedAdoption[idx],
    0
  );

  for (let i = 0; i < months; i++) {
    const churned = Math.min(customers, customers * churn);
    const next = Math.max(0, customers + monthlyAcquisition - churned);
    customers = next;
    customers_by_month.push(Math.round(customers));
    const recognized = customers * avgRevenuePerCustomer;
    mrr_by_month.push(recognized);
    deferred_by_month.push(recognized); // simplified deferral
    input.tier_revenues.forEach((rev, idx) => {
      const perTierCustomers = customers * normalizedAdoption[idx];
      tier_revenue_by_month[idx].push(perTierCustomers * rev);
    });
  }

  return {
    projections: {
      monthLabels,
      customers_by_month,
      mrr_by_month,
      deferred_revenue_by_month: deferred_by_month,
      tier_revenues_end: input.tier_revenues,
      tier_revenue_by_month,
    },
    metrics: {
      total_mrr: mrr_by_month[mrr_by_month.length - 1],
      total_customers: customers_by_month[customers_by_month.length - 1],
      annual_revenue: mrr_by_month.slice(0, 12).reduce((a, b) => a + b, 0),
      customer_ltv:
        ((mrr_by_month.reduce((a, b) => a + b, 0) / months) *
          (1 - (input.operating_expense_rate ?? 0) / 100)) /
        (churn || 1),
      new_customers_monthly:
        customers_by_month[1] - (input.initial_customers || 10),
    },
  };
}
