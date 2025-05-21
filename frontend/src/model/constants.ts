export const DEFAULT_TIER_REVENUES = [500, 1200, 3000, 7500];
export const DEFAULT_MARKETING_BUDGET = 15000;
export const DEFAULT_COST_PER_LEAD = 125;
export const DEFAULT_CONVERSION_RATE = 1; // percent
export const DEFAULT_MONTHLY_CHURN_RATE = 8; // percent
export const DEFAULT_WACC = 8; // percent
export const DEFAULT_INITIAL_CAC_SMB = 239;
export const DEFAULT_PROJECTION_MONTHS = 24;
export const DEFAULT_INITIAL_INVESTMENT = 200000;
export const DEFAULT_OPERATING_EXPENSE_RATE = 12;
export const DEFAULT_FIXED_COSTS = 1500;
export const MONTHLY_WACC = (0.08 / 12) * 100; // percent
export const COST_PER_MILLE = 8; // cost per 1000 impressions
export const DEFAULT_CTR = 0.75; // percent
// Default customer mix across pricing tiers, approximating a
// typical distribution weighted toward lower tiers.
export const DEFAULT_TIER_ADOPTION = [0.4, 0.3, 0.2, 0.1];
// Weights for blended averages favoring lower tiers
export const BLENDED_WEIGHTS = [0.6, 0.25, 0.1, 0.05];

export const TIER_CPL_FACTORS = [1, 1.6, 2.5, 4];
export const TIER_CVR_FACTORS = [1, 0.65, 0.35, 0.15];
export const TIER_BUDGET_SPLIT = [0.4, 0.3, 0.2, 0.1];

export const DEFAULT_COST_OF_CARBON = 18;
export const DEFAULT_TONS_PER_CUSTOMER = [10, 25, 70, 200];
