export const TIER_CPL_FACTORS = [1, 1.6, 2.5, 4];
export const TIER_CVR_FACTORS = [1, 0.65, 0.35, 0.15];
export const TIER_CTR_FACTORS = [1, 0.65, 0.35, 0.15];
export const TIER_BUDGET_SPLIT = [0.4, 0.3, 0.2, 0.1];

export interface TierMetrics {
  cpl: number[];
  cvr: number[];
  clicks: number[];
  leads: number[];
  newCustomers: number[];
  totalLeads: number;
  totalNewCustomers: number;
  totalClicks: number;
}

export function calculateTierMetrics(
  baseCvr: number,
  totalBudget: number,
  ctr: number,
  costPerMille: number,
  tierFactors?: number[],
): TierMetrics {
  const budgets = TIER_BUDGET_SPLIT.map(
    (s, idx) => totalBudget * s * (tierFactors ? (tierFactors[idx] ?? 1) : 1),
  );
  const ctrs = TIER_CTR_FACTORS.map((f) => ctr * f);
  const cvr = TIER_CVR_FACTORS.map((f) => Math.max(baseCvr * f, 0.1));
  const impressions = budgets.map((b) => (b / costPerMille) * 1000);
  const clicks = impressions.map((imp, idx) => imp * (ctrs[idx] / 100));
  const leads = clicks.map((clk, idx) => clk * (cvr[idx] / 100));
  const cpl = leads.map((l, idx) => (l ? budgets[idx] / l : 0));
  const totalLeads = leads.reduce((a, b) => a + b, 0);
  return {
    cpl,
    cvr,
    clicks,
    leads,
    newCustomers: leads,
    totalLeads,
    totalNewCustomers: totalLeads,
    totalClicks: clicks.reduce((a, b) => a + b, 0),
  };
}
