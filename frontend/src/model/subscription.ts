import { calculateTierMetrics } from "./marketing";
import {
  COST_PER_MILLE,
  DEFAULT_TONS_PER_CUSTOMER,
  DEFAULT_COST_OF_CARBON,
  DEFAULT_CTR,
} from "./constants";
export interface SubscriptionInput {
  projection_months: number;
  churn_rate_smb: number;
  tier_revenues: number[];
  initial_customers?: number;
  marketing_budget?: number;
  conversion_rate?: number;
  ctr?: number;
  operating_expense_rate?: number;
  fixed_costs?: number;
  tier_adoption_rates?: number[];
  cost_of_carbon?: number;
  carbon_per_customer?: number[];
}

export interface SubscriptionResult {
  projections: {
    monthLabels: string[];
    customers_by_month: number[];
    mrr_by_month: number[];
    impressions_by_month: number[];
    clicks_by_month: number[];
    leads_by_month: number[];
    new_customers_by_month: number[];
    tier_revenues_end: number[];
    tier_revenue_by_month: number[][];
    deferred_revenue_by_month: number[];
    free_cash_flow: number[];
    carbon_tons_by_month: number[];
    carbon_cost_by_month: number[];
  };
  metrics: {
    total_mrr: number;
    total_subscribers: number;
    annual_revenue: number;
    subscriber_ltv: number;
    new_subscribers_monthly: number;
    blended_cpl: number;
    blended_cvr: number;
    carbon_ordered: number;
    carbon_spend_pct: number;
    blended_usd_per_ton: number;
    margin_warning: boolean;
  };
  flags: string[];
}

export function runSubscriptionModel(
  input: SubscriptionInput,
): SubscriptionResult {
  const months = input.projection_months || 12;
  const churn = input.churn_rate_smb / 100;

  const adoption =
    input.tier_adoption_rates &&
    input.tier_adoption_rates.length === input.tier_revenues.length
      ? input.tier_adoption_rates.slice()
      : Array(input.tier_revenues.length).fill(
          1 / (input.tier_revenues.length || 1),
        );
  const totalRate = adoption.reduce((a, b) => a + b, 0) || 1;
  const normalizedAdoption = adoption.map((r) => r / totalRate);

  const monthLabels = Array.from({ length: months }, (_, i) => `M${i + 1}`);
  let customers = input.initial_customers || 10;
  const customers_by_month: number[] = [];
  const mrr_by_month: number[] = [];
  const deferred_by_month: number[] = [];
  const tier_revenue_by_month: number[][] = Array.from(
    { length: input.tier_revenues.length },
    () => [] as number[],
  );

  const tonsPerCustomer =
    input.carbon_per_customer &&
    input.carbon_per_customer.length === input.tier_revenues.length
      ? input.carbon_per_customer.slice()
      : DEFAULT_TONS_PER_CUSTOMER.slice();
  const costPerTon = input.cost_of_carbon ?? DEFAULT_COST_OF_CARBON;
  const carbon_tons_by_month: number[] = [];
  const carbon_cost_by_month: number[] = [];
  let marginWarning = false;
  const priceFlags: string[] = [];
  tonsPerCustomer.forEach((t, idx) => {
    if (t * costPerTon > input.tier_revenues[idx]) {
      priceFlags.push(`tier${idx + 1}_price_override`);
    }
  });

  const avgRevenuePerCustomer = input.tier_revenues.reduce(
    (sum, rev, idx) => sum + rev * normalizedAdoption[idx],
    0,
  );
  const impressions_by_month: number[] = [];
  const clicks_by_month: number[] = [];
  const leads_by_month: number[] = [];
  const new_customers_by_month: number[] = [];
  const free_cash_flow: number[] = [];

  for (let i = 0; i < months; i++) {
    const tierMetrics =
      input.marketing_budget && input.conversion_rate
        ? calculateTierMetrics(
            input.conversion_rate,
            input.marketing_budget,
            input.ctr ?? DEFAULT_CTR,
            COST_PER_MILLE,
          )
        : ({ totalLeads: 0, totalNewCustomers: 0 } as any);

    const leads = (tierMetrics.totalLeads as number) || 0;
    const newCust = (tierMetrics.totalNewCustomers as number) || 0;
    const imp = input.marketing_budget
      ? (input.marketing_budget / COST_PER_MILLE) * 1000
      : 0;
    const clk = imp * ((input.ctr ?? 1) / 100);

    const churned = Math.min(customers, customers * churn);
    const next = Math.max(0, customers + newCust - churned);
    customers = next;

    customers_by_month.push(customers);
    const recognized = customers * avgRevenuePerCustomer;
    mrr_by_month.push(recognized);
    deferred_by_month.push(recognized);
    impressions_by_month.push(imp);
    clicks_by_month.push(clk);
    leads_by_month.push(leads);
    new_customers_by_month.push(newCust);

    let carbonTons = 0;
    input.tier_revenues.forEach((rev, idx) => {
      const perTierCustomers = customers * normalizedAdoption[idx];
      tier_revenue_by_month[idx].push(perTierCustomers * rev);
      carbonTons += perTierCustomers * tonsPerCustomer[idx];
    });
    const carbonCost = carbonTons * costPerTon;
    carbon_tons_by_month.push(carbonTons);
    carbon_cost_by_month.push(carbonCost);
    if (carbonCost > recognized * 0.6) {
      marginWarning = true;
    }
    const gp =
      (recognized - carbonCost) *
      (1 - (input.operating_expense_rate ?? 0) / 100);
    const cash = gp - (input.fixed_costs ?? 0) - (input.marketing_budget ?? 0);
    free_cash_flow.push(cash);
  }

  return {
    projections: {
      monthLabels,
      customers_by_month,
      mrr_by_month,
      impressions_by_month,
      clicks_by_month,
      leads_by_month,
      new_customers_by_month,
      deferred_revenue_by_month: deferred_by_month,
      tier_revenues_end: input.tier_revenues,
      tier_revenue_by_month,
      free_cash_flow,
      carbon_tons_by_month,
      carbon_cost_by_month,
    },
    metrics: {
      total_mrr: mrr_by_month[mrr_by_month.length - 1],
      total_subscribers: customers_by_month[customers_by_month.length - 1],
      annual_revenue: mrr_by_month.slice(0, 12).reduce((a, b) => a + b, 0),
      subscriber_ltv:
        (avgRevenuePerCustomer *
          (1 - (input.operating_expense_rate ?? 0) / 100)) /
        (churn || 1),
      new_subscribers_monthly:
        customers_by_month[1] - (input.initial_customers || 10),
      blended_cpl:
        leads_by_month[0] > 0
          ? (input.marketing_budget ?? 0) / leads_by_month[0]
          : 0,
      blended_cvr:
        leads_by_month[0] > 0
          ? (new_customers_by_month[0] / leads_by_month[0]) * 100
          : 0,
      carbon_ordered: carbon_tons_by_month[carbon_tons_by_month.length - 1],
      carbon_spend_pct:
        mrr_by_month[mrr_by_month.length - 1] > 0
          ? (carbon_cost_by_month[carbon_cost_by_month.length - 1] /
              mrr_by_month[mrr_by_month.length - 1]) *
            100
          : 0,
      blended_usd_per_ton:
        carbon_tons_by_month[carbon_tons_by_month.length - 1] > 0
          ? carbon_cost_by_month[carbon_cost_by_month.length - 1] /
            carbon_tons_by_month[carbon_tons_by_month.length - 1]
          : 0,
      margin_warning: marginWarning,
    },
    flags: [...priceFlags, ...(marginWarning ? ["margin_warning"] : [])],
  };
}
