import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

try:
    from fastapi.templating import Jinja2Templates
    import jinja2

    _templates_available = True
except Exception:  # Jinja2 may not be installed
    Jinja2Templates = None
    _templates_available = False
from pathlib import Path
from typing import List, Optional

from pydantic import BaseModel
from .marketing import calculate_tier_metrics, export_audit
from .projection import run_projection

app = FastAPI(title="Catona Dashboard")


def parse_env_list(name: str, default: str) -> List[str]:
    """Return a cleaned list from a comma separated environment variable."""
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


origins = parse_env_list("CORS_ALLOW_ORIGINS", "http://localhost:3000")
methods = parse_env_list("CORS_ALLOW_METHODS", "GET,POST")
headers = parse_env_list("CORS_ALLOW_HEADERS", "Content-Type")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=methods,
    allow_headers=headers,
)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/api/health")
async def health():
    """Simple health check endpoint."""
    return {"status": "ok"}


dist_dir = Path("frontend/dist")
templates: Optional[Jinja2Templates]
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=dist_dir / "assets"), name="assets")
    templates = (
        Jinja2Templates(directory=str(dist_dir)) if _templates_available else None
    )
else:
    templates = Jinja2Templates(directory="frontend") if _templates_available else None


class KPI(BaseModel):
    name: str
    value: float


class KPIRequest(BaseModel):
    mrr: float
    arpu: float
    churn_rate: float
    active_users: int


class MarketingRequest(BaseModel):
    marketing_spend: float
    cost_per_lead: float
    conversion_rate: float


class FinancialRequest(BaseModel):
    wacc: float
    irr: float
    stripe_fee: float
    carbon_cost: float


class CalculationRequest(BaseModel):
    kpi: KPIRequest
    marketing: MarketingRequest
    financial: FinancialRequest


class CalculationResponse(BaseModel):
    annual_revenue: float
    ltv: float
    cac: float


class TierMetricResponse(BaseModel):
    cpl: List[float]
    cvr: List[float]
    leads: List[float]
    new_customers: List[float]
    total_leads: float
    total_new_customers: float


class ProjectionRequest(BaseModel):
    marketing_budget: float
    base_cvr: float
    ctr: float = 18.0
    months: int = 24


class ProjectionResponse(BaseModel):
    impressions: List[float]
    clicks: List[float]
    leads: List[float]
    new_customers: List[float]
    active_customers: List[float]
    total_mrr: List[float]
    gross_profit: List[float]
    cac: List[float]
    free_cash_flow: List[float]
    kpis: dict
    flags: List[str]


@app.get("/api/kpis", response_model=List[KPI])
async def get_kpis():
    tier_revenues = [1000, 2500, 5000, 10000]
    marketing_budget = 5000
    cpl = 50
    conversion_rate = 0.1
    churn = 0.05
    months = 24
    customers = 10.0
    monthly_acquisition = (marketing_budget / max(cpl, 1)) * conversion_rate
    avg_rev = sum(tier_revenues) / len(tier_revenues)
    for _ in range(months):
        customers = max(0.0, customers * (1 - churn) + monthly_acquisition)
    total_mrr = customers * avg_rev
    annual_revenue = total_mrr * 12
    ltv = avg_rev / churn if churn else 0
    data = [
        KPI(name="Total MRR", value=round(total_mrr, 2)),
        KPI(name="Annual Revenue", value=round(annual_revenue, 2)),
        KPI(name="Customer LTV", value=round(ltv, 2)),
        KPI(name="Active Users", value=round(customers, 2)),
    ]
    return data


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    dist_index = Path("frontend/dist/index.html")
    if dist_index.exists():
        return FileResponse(dist_index)
    if templates is not None:
        return templates.TemplateResponse("index.html", {"request": request})
    return FileResponse(Path("frontend/index.html"))


@app.post("/api/calculate", response_model=CalculationResponse)
async def calculate(data: CalculationRequest):
    annual_revenue = data.kpi.mrr * 12
    ltv = data.kpi.arpu / max(data.kpi.churn_rate, 1e-6)
    # Simple marketing conversion assumptions
    conversions = (
        data.marketing.marketing_spend / max(data.marketing.cost_per_lead, 1e-6)
    ) * data.marketing.conversion_rate
    cac = data.marketing.marketing_spend / max(conversions, 1e-6)
    return CalculationResponse(annual_revenue=annual_revenue, ltv=ltv, cac=cac)


@app.get("/api/marketing/tiers", response_model=TierMetricResponse)
async def marketing_tiers(baseCvr: float, totalBudget: float, ctr: float):
    return calculate_tier_metrics(baseCvr, totalBudget, ctr)


@app.get("/api/audit/export")
async def audit_export(baseCvr: float, totalBudget: float, ctr: float):
    return export_audit(baseCvr, totalBudget, ctr)


@app.post("/api/projection", response_model=ProjectionResponse)
async def projection(data: ProjectionRequest):
    return run_projection(
        marketing_budget=data.marketing_budget,
        months=data.months,
        base_cvr=data.base_cvr,
        ctr=data.ctr,
    )
