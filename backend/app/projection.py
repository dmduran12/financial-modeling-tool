from typing import List, TypedDict
from math import pow

from .marketing import calculate_tier_metrics, guardrail_flags

BASE_CVR = 2.75
TIER_PRICES = [500.0, 1200.0, 3000.0, 7500.0]
MONTHLY_CHURN = 0.10
OPERATING_EXPENSE_RATE = 0.15
FIXED_COSTS = 1500.0
MONTHLY_WACC = 0.08 / 12
PROJECTION_MONTHS = 24
INITIAL_INVESTMENT = 200000.0
CPI = 8.0  # cost per 1000 impressions
ADOPTION = [0.45, 0.3, 0.15, 0.1]
# Weigh lower tiers more heavily when computing blended metrics
BLENDED_WEIGHTS = [0.6, 0.25, 0.1, 0.05]


class ProjectionKPIs(TypedDict):
    npv: float
    paybackMonths: float
    subscriberLtv: float
    blendedCvr: float
    blendedCpl: float


class ProjectionResult(TypedDict):
    impressions: List[float]
    clicks: List[float]
    leads: List[float]
    new_customers: List[float]
    active_customers: List[float]
    total_mrr: List[float]
    gross_profit: List[float]
    cac: List[float]
    free_cash_flow: List[float]
    kpis: ProjectionKPIs
    flags: List[str]


def run_projection(
    marketing_budget: float,
    months: int = PROJECTION_MONTHS,
    base_cvr: float = BASE_CVR,
    ctr: float = 19.0,
) -> ProjectionResult:
    flags = guardrail_flags(base_cvr)
    tier_metrics = calculate_tier_metrics(base_cvr, marketing_budget, ctr)
    clicks_per_tier = tier_metrics["clicks"]
    new_per_tier = tier_metrics["new_customers"]
    imp_per_month = (marketing_budget / CPI) * 1000
    clk_per_month = sum(clicks_per_tier)
    leads_per_month = sum(new_per_tier)
    new_per_month = leads_per_month

    impressions: List[float] = []
    clicks: List[float] = []
    leads_total: List[float] = []
    new_customers_total: List[float] = []
    active_customers_list: List[float] = []
    total_mrr: List[float] = []
    gross_profit: List[float] = []
    cac: List[float] = []
    fcf: List[float] = []

    active_customers = 0.0
    avg_price = sum(p * a for p, a in zip(TIER_PRICES, ADOPTION))

    for _ in range(months):
        imp = imp_per_month
        clk = clk_per_month
        leads = new_per_tier
        total_new = new_per_month
        churned = active_customers * MONTHLY_CHURN
        active_customers = max(0.0, active_customers + new_per_month - churned)

        tier_active = [active_customers * a for a in ADOPTION]
        mrr_by_tier = [tier_active[i] * TIER_PRICES[i] for i in range(4)]
        mrr = sum(mrr_by_tier)
        gp = mrr * (1 - OPERATING_EXPENSE_RATE)
        cash = gp - FIXED_COSTS - marketing_budget
        cac_val = marketing_budget / new_per_month if new_per_month else 0.0

        impressions.append(imp_per_month)
        clicks.append(clk_per_month)
        leads_total.append(leads_per_month)
        new_customers_total.append(new_per_month)
        active_customers_list.append(active_customers)
        total_mrr.append(mrr)
        gross_profit.append(gp)
        fcf.append(cash)
        cac.append(cac_val)

    weighted_clicks = sum(c * w for c, w in zip(clicks_per_tier, BLENDED_WEIGHTS))
    weighted_new = sum(n * w for n, w in zip(new_per_tier, BLENDED_WEIGHTS))
    blended_cvr = weighted_new / weighted_clicks * 100 if weighted_clicks else 0
    blended_cpl = marketing_budget / weighted_new if weighted_new else 0
    ltv = (avg_price * (1 - OPERATING_EXPENSE_RATE)) / MONTHLY_CHURN
    payback = cac[-1] / (avg_price * (1 - OPERATING_EXPENSE_RATE)) if avg_price else 0
    npv = (
        sum(cf / pow(1 + MONTHLY_WACC, i + 1) for i, cf in enumerate(fcf))
        - INITIAL_INVESTMENT
    )

    return {
        "impressions": impressions,
        "clicks": clicks,
        "leads": leads_total,
        "new_customers": new_customers_total,
        "active_customers": active_customers_list,
        "total_mrr": total_mrr,
        "gross_profit": gross_profit,
        "cac": cac,
        "free_cash_flow": fcf,
        "kpis": {
            "npv": npv,
            "paybackMonths": payback,
            "subscriberLtv": ltv,
            "blendedCvr": blended_cvr,
            "blendedCpl": blended_cpl,
        },
        "flags": flags,
    }
