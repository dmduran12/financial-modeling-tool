from typing import List, Dict, Tuple, TypedDict

TIER_CPL_FACTORS: List[float] = [1.0, 1.6, 2.5, 4.0]
TIER_CVR_FACTORS: List[float] = [1.0, 0.65, 0.35, 0.15]
TIER_BUDGET_SPLIT: List[float] = [0.4, 0.3, 0.2, 0.1]
CPI: float = 8.0  # cost per 1000 impressions

BENCHMARK_RANGES: List[Dict[str, Tuple[float, float]]] = [
    {"cpl": (100, 200), "cvr": (2, 4)},
    {"cpl": (225, 350), "cvr": (1, 2)},
    {"cpl": (350, 600), "cvr": (0.5, 1.0)},
    {"cpl": (600, 1200), "cvr": (0.2, 0.6)},
]


class TierMetrics(TypedDict):
    """Metric breakdown for each marketing tier."""
    cpl: List[float]
    cvr: List[float]
    leads: List[float]
    new_customers: List[float]
    total_leads: float
    total_new_customers: float


def derive_cvr_by_tier(base_cvr: float) -> List[float]:
    """Return CVR percentages for each tier based on base CVR."""
    return [max(base_cvr * f, 0.1) for f in TIER_CVR_FACTORS]


def split_budget(total: float) -> List[float]:
    """Split total budget according to the default ratio."""
    return [total * s for s in TIER_BUDGET_SPLIT]


def calculate_tier_metrics(
    base_cvr: float, total_budget: float, ctr: float
) -> TierMetrics:
    """Calculate CPL, CVR, leads and new customers for each tier."""
    budgets = split_budget(total_budget)
    impressions_total = (total_budget / CPI) * 1000
    total_leads = impressions_total * (ctr / 100.0)
    weight_sum = sum(b / f for b, f in zip(budgets, TIER_CPL_FACTORS))
    leads = [
        total_leads * ((budget / factor) / weight_sum) if weight_sum else 0
        for budget, factor in zip(budgets, TIER_CPL_FACTORS)
    ]
    cpl = [budget / lead if lead else 0 for budget, lead in zip(budgets, leads)]
    cvr = derive_cvr_by_tier(base_cvr)
    new_customers = [lead * (cv / 100.0) for lead, cv in zip(leads, cvr)]
    total_new_customers = sum(new_customers)
    return {
        "cpl": cpl,
        "cvr": cvr,
        "leads": leads,
        "new_customers": new_customers,
        "total_leads": total_leads,
        "total_new_customers": total_new_customers,
    }


def guardrail_flags(base_cvr: float) -> List[str]:
    """Return list of strings describing any data quality issues."""
    flags: List[str] = []
    if base_cvr > 6 or base_cvr < 0.1:
        flags.append("base_cvr_out_of_range")
    tier_cvr = [max(base_cvr * f, 0.1) for f in TIER_CVR_FACTORS]
    for idx, cv in enumerate(tier_cvr):
        low, high = BENCHMARK_RANGES[idx]["cvr"]
        if cv < low or cv > high:
            flags.append(f"tier{idx+1}_cvr_out_of_range")
    return flags


class AuditRow(TypedDict):
    tier: int
    cpl: float
    cpl_range: Tuple[float, float]
    cpl_flag: bool
    cvr: float
    cvr_range: Tuple[float, float]
    cvr_flag: bool


def export_audit(base_cvr: float, total_budget: float, ctr: float) -> List[AuditRow]:
    metrics = calculate_tier_metrics(base_cvr, total_budget, ctr)
    result: List[AuditRow] = []

    for i in range(4):
        cpl_range = BENCHMARK_RANGES[i]["cpl"]
        cvr_range = BENCHMARK_RANGES[i]["cvr"]
        cpl_median = sum(cpl_range) / 2
        cvr_median = sum(cvr_range) / 2
        derived_cpl = metrics["cpl"][i]
        derived_cvr = metrics["cvr"][i]
        result.append(
            {
                "tier": i + 1,
                "cpl": derived_cpl,
                "cpl_range": cpl_range,
                "cpl_flag": abs(derived_cpl - cpl_median) > 0.2 * cpl_median,
                "cvr": derived_cvr,
                "cvr_range": cvr_range,
                "cvr_flag": abs(derived_cvr - cvr_median) > 0.2 * cvr_median,
            }
        )
    return result
