from typing import List, Dict, Tuple

TIER_CPL_FACTORS: List[float] = [1.0, 1.6, 2.5, 4.0]
TIER_CVR_FACTORS: List[float] = [1.0, 0.65, 0.35, 0.15]
TIER_BUDGET_SPLIT: List[float] = [0.4, 0.3, 0.2, 0.1]

BENCHMARK_RANGES: List[Dict[str, Tuple[float, float]]] = [
    {"cpl": (100, 200), "cvr": (4, 6)},
    {"cpl": (225, 350), "cvr": (2, 3)},
    {"cpl": (350, 600), "cvr": (1, 1.5)},
    {"cpl": (600, 1200), "cvr": (0.3, 0.8)},
]


def calculate_tier_metrics(base_cpl: float, base_cvr: float, total_budget: float) -> Dict[str, object]:
    """Calculate CPL, CVR, leads and new customers for each tier."""
    cpl = [base_cpl * f for f in TIER_CPL_FACTORS]
    cvr = [max(base_cvr * f, 0.1) for f in TIER_CVR_FACTORS]
    budgets = [total_budget * s for s in TIER_BUDGET_SPLIT]
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


def export_audit(base_cpl: float, base_cvr: float, total_budget: float) -> List[Dict[str, object]]:
    metrics = calculate_tier_metrics(base_cpl, base_cvr, total_budget)
    result = []
    for i in range(4):
        cpl_range = BENCHMARK_RANGES[i]["cpl"]
        cvr_range = BENCHMARK_RANGES[i]["cvr"]
        cpl_median = sum(cpl_range) / 2
        cvr_median = sum(cvr_range) / 2
        derived_cpl = metrics["cpl"][i]
        derived_cvr = metrics["cvr"][i]
        result.append({
            "tier": i + 1,
            "cpl": derived_cpl,
            "cpl_range": cpl_range,
            "cpl_flag": abs(derived_cpl - cpl_median) > 0.2 * cpl_median,
            "cvr": derived_cvr,
            "cvr_range": cvr_range,
            "cvr_flag": abs(derived_cvr - cvr_median) > 0.2 * cvr_median,
        })
    return result
