export const TIER_CPL_FACTORS = [1, 1.6, 2.5, 4];
export const TIER_CVR_FACTORS = [1, 0.65, 0.35, 0.15];
export const TIER_BUDGET_SPLIT = [0.4, 0.3, 0.2, 0.1];

export interface TierMetrics {
  cpl: number[];
  cvr: number[];
  leads: number[];
  newCustomers: number[];
  totalLeads: number;
  totalNewCustomers: number;
}

export function calculateTierMetrics(
  baseCvr: number,
  totalBudget: number,
  ctr: number,
  costPerMille: number,
): TierMetrics {
  const budgets = TIER_BUDGET_SPLIT.map((s) => totalBudget * s);
  const totalLeads = (totalBudget / costPerMille) * 1000 * (ctr / 100);
  const weightSum = budgets.reduce(
    (sum, b, idx) => sum + b / TIER_CPL_FACTORS[idx],
    0,
  );
  const leads = budgets.map((b, idx) =>
    weightSum ? totalLeads * (b / TIER_CPL_FACTORS[idx] / weightSum) : 0,
  );
  const cpl = leads.map((l, idx) => (l ? budgets[idx] / l : 0));
  const cvr = TIER_CVR_FACTORS.map((f) => Math.max(baseCvr * f, 0.1));
  const newCustomers = leads.map((l, idx) => l * (cvr[idx] / 100));
  const totalNewCustomers = newCustomers.reduce((a, b) => a + b, 0);
  return { cpl, cvr, leads, newCustomers, totalLeads, totalNewCustomers };
}
