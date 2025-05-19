export const DEFAULT_TIER_REVENUES = [500, 1200, 3000, 7500];
export const DEFAULT_MARKETING_BUDGET = 10000;
export const DEFAULT_COST_PER_LEAD = 150;
export const DEFAULT_CONVERSION_RATE = 2.5; // percent
export const DEFAULT_MONTHLY_CHURN_RATE = 3; // percent
export const DEFAULT_WACC = 8; // percent
export const DEFAULT_INITIAL_CAC_SMB = 239;
export const DEFAULT_PROJECTION_MONTHS = 24;
export const DEFAULT_INITIAL_INVESTMENT = 200000;
export const DEFAULT_OPERATING_EXPENSE_RATE = 35;
export const DEFAULT_FIXED_COSTS = Math.round(50000 / 12);
// Default customer mix across pricing tiers, approximating a
// typical distribution weighted toward lower tiers.
export const DEFAULT_TIER_ADOPTION = [0.45, 0.3, 0.15, 0.1];

export const TIER_CPL_FACTORS = [1, 1.6, 2.5, 4];
export const TIER_CVR_FACTORS = [1, 0.65, 0.35, 0.15];
export const TIER_BUDGET_SPLIT = [0.4, 0.3, 0.2, 0.1];
