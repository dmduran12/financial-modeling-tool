from backend.app.projection import run_projection
import json
from pathlib import Path


def test_projection_non_negative():
    res = run_projection(10000, months=3)
    assert all(v >= 0 for v in res["active_customers"])
    assert sum(res["leads"]) >= res["leads"][0]


def test_projection_baseline_snapshot():
    inputs = json.load(open(Path("tests/fixtures/baseline_input.json")))
    expected = json.load(open(Path("tests/fixtures/baseline_output.json")))
    assert run_projection(**inputs) == expected


def test_projection_zero_budget():
    res = run_projection(0, months=1)
    assert res["new_customers"] == [0]
    assert res["active_customers"] == [0]
