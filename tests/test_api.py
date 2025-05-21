import pytest
from httpx import AsyncClient

import sys
from pathlib import Path

# Ensure project root is in sys.path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from backend.app.main import app as app_with_frontend
from backend.main import app as api_only_app
from backend.app.projection import run_projection
import json


@pytest.mark.asyncio
async def test_index_returns_html():
    async with AsyncClient(app=app_with_frontend, base_url="http://test") as ac:
        resp = await ac.get("/")
    assert resp.status_code == 200
    assert "text/html" in resp.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_calculate_endpoint():
    payload = {
        "kpi": {"mrr": 100, "arpu": 10, "churn_rate": 0.1, "active_users": 50},
        "marketing": {
            "marketing_spend": 1000,
            "cost_per_lead": 50,
            "conversion_rate": 0.1,
        },
        "financial": {"wacc": 0.05, "irr": 0.1, "stripe_fee": 0.029, "carbon_cost": 0},
    }
    async with AsyncClient(app=app_with_frontend, base_url="http://test") as ac:
        resp = await ac.post("/api/calculate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert set(data.keys()) == {"annual_revenue", "ltv", "cac"}


@pytest.mark.asyncio
async def test_get_kpis():
    async with AsyncClient(app=api_only_app, base_url="http://test") as ac:
        resp = await ac.get("/api/kpis")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert data and "name" in data[0]


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(app=api_only_app, base_url="http://test") as ac:
        resp = await ac.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_audit_export_endpoint():
    async with AsyncClient(app=api_only_app, base_url="http://test") as ac:
        resp = await ac.get(
            "/api/audit/export",
            params={"baseCpl": 150, "baseCvr": 4, "totalBudget": 10000},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 4
    assert "cpl" in data[0]


@pytest.mark.asyncio
async def test_projection_endpoint_matches_library():
    inputs = json.load(open(Path("tests/fixtures/baseline_input.json")))
    expected = run_projection(**inputs)
    async with AsyncClient(app=api_only_app, base_url="http://test") as ac:
        resp = await ac.post("/api/projection", json=inputs)
    assert resp.status_code == 200
    assert resp.json() == expected
