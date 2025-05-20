from typing import List, Dict, Tuple

TIER_CPL_FACTORS: List[float] = [1.0, 1.6, 2.5, 4.0]
TIER_CVR_FACTORS: List[float] = [1.0, 0.65, 0.35, 0.15]
TIER_BUDGET_SPLIT: List[float] = [0.4, 0.3, 0.2, 0.1]

BENCHMARK_RANGES: List[Dict[str, Tuple[float, float]]] = [
    {"cpl": (100, 200), "cvr": (2, 4)},
    {"cpl": (225, 350), "cvr": (1, 2)},
    {"cpl": (350, 600), "cvr": (0.5, 1.0)},
    {"cpl": (600, 1200), "cvr": (0.2, 0.6)},
]


def derive_cpl_by_tier(base_cpl: float) -> List[float]:
    """Return CPL values for each tier based on base CPL."""
    return [base_cpl * f for f in TIER_CPL_FACTORS]


def derive_cvr_by_tier(base_cvr: float) -> List[float]:
    """Return CVR percentages for each tier based on base CVR."""
    return [max(base_cvr * f, 0.1) for f in TIER_CVR_FACTORS]


def split_budget(total: float) -> List[float]:
    """Split total budget according to the default ratio."""
    return [total * s for s in TIER_BUDGET_SPLIT]


def calculate_tier_metrics(
    base_cpl: float, base_cvr: float, total_budget: float
) -> Dict[str, object]:
    """Calculate CPL, CVR, leads and new customers for each tier."""
    cpl = derive_cpl_by_tier(base_cpl)
    cvr = derive_cvr_by_tier(base_cvr)
    budgets = split_budget(total_budget)
    leads = [b / c if c else 0 for b, c in zip(budgets, cpl)]
    new_customers: List[float] = []
    for b, c, r in zip(budgets, cpl, cvr):
        if b < c:
            new_customers.append(0.0)
        else:
            new_customers.append((b / c) * (r / 100.0))
    total_leads = sum(leads)
    total_new_customers = sum(new_customers)
    return {
        "cpl": cpl,
        "cvr": cvr,
        "leads": leads,
        "new_customers": new_customers,
        "total_leads": total_leads,
        "total_new_customers": total_new_customers,
    }


def guardrail_flags(base_cpl: float, base_cvr: float) -> List[str]:
    """Return list of strings describing any data quality issues."""
    flags: List[str] = []
    if base_cvr > 6 or base_cvr < 0.1:
        flags.append("base_cvr_out_of_range")
    if base_cpl < 50 or base_cpl > 300:
        flags.append("base_cpl_out_of_range")
    tier_cvr = [max(base_cvr * f, 0.1) for f in TIER_CVR_FACTORS]
    for idx, cv in enumerate(tier_cvr):
        low, high = BENCHMARK_RANGES[idx]["cvr"]
        if cv < low or cv > high:
            flags.append(f"tier{idx+1}_cvr_out_of_range")
    return flags


def export_audit(
    base_cpl: float, base_cvr: float, total_budget: float
) -> List[Dict[str, object]]:
    metrics = calculate_tier_metrics(base_cpl, base_cvr, total_budget)
    result = []
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
