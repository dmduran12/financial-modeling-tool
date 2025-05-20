from backend.app.projection import run_projection


def test_projection_non_negative():
    res = run_projection(10000, months=3)
    assert all(v >= 0 for v in res["active_customers"])
    assert sum(res["leads"]) >= res["leads"][0]


