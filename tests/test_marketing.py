from backend.app.marketing import calculate_tier_metrics, guardrail_flags

def test_sum_matches_total():
    res = calculate_tier_metrics(150, 4, 10000)
    assert abs(sum(res['new_customers']) - res['total_new_customers']) < 1e-6


def test_guardrails_flags_none_for_reasonable_inputs():
    flags = guardrail_flags(150, 2.75)
    assert flags == []
