from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Catona Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/favicon.ico")
async def favicon():
    """Serve the site's favicon."""
    icon_path = Path(__file__).resolve().parents[2] / "favicon.ico"
    return FileResponse(icon_path)

templates = Jinja2Templates(directory="frontend")

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


@app.get("/api/kpis", response_model=List[KPI])
async def get_kpis():
    data = [
        KPI(name="Total MRR", value=256000),
        KPI(name="Annual Revenue", value=998000),
        KPI(name="Customer LTV", value=2000),
        KPI(name="Active Users", value=35)
    ]
    return data

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/calculate", response_model=CalculationResponse)
async def calculate(data: CalculationRequest):
    annual_revenue = data.kpi.mrr * 12
    ltv = data.kpi.arpu / max(data.kpi.churn_rate, 1e-6)
    # Simple marketing conversion assumptions
    conversions = (data.marketing.marketing_spend / max(data.marketing.cost_per_lead, 1e-6)) * data.marketing.conversion_rate
    cac = data.marketing.marketing_spend / max(conversions, 1e-6)
    return CalculationResponse(annual_revenue=annual_revenue, ltv=ltv, cac=cac)