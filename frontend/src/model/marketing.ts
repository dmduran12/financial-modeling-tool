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

export function calculateTierMetrics(baseCpl: number, baseCvr: number, totalBudget: number): TierMetrics {
  const cpl = TIER_CPL_FACTORS.map(f => baseCpl * f);
  const cvr = TIER_CVR_FACTORS.map(f => Math.max(baseCvr * f, 0.1));
  const budgets = TIER_BUDGET_SPLIT.map(s => totalBudget * s);
  const leads = budgets.map((b, idx) => cpl[idx] ? b / cpl[idx] : 0);
  const newCustomers = budgets.map((b, idx) => (b < cpl[idx]) ? 0 : leads[idx] * (cvr[idx]/100));
  const totalLeads = leads.reduce((a,b) => a + b, 0);
  const totalNewCustomers = newCustomers.reduce((a,b) => a + b, 0);
  return { cpl, cvr, leads, newCustomers, totalLeads, totalNewCustomers };
}
