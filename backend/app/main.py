import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from pydantic import BaseModel
from typing import List
from pathlib import Path

app = FastAPI(title="Catona Dashboard")

origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000").split(",")
methods = os.getenv("CORS_ALLOW_METHODS", "GET,POST").split(",")
headers = os.getenv("CORS_ALLOW_HEADERS", "Content-Type").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins],
    allow_methods=[method.strip() for method in methods],
    allow_headers=[header.strip() for header in headers],
)

app.mount("/static", StaticFiles(directory="static"), name="static")


dist_dir = Path("frontend/dist")
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=dist_dir / "assets"), name="assets")
    templates = Jinja2Templates(directory=str(dist_dir))
else:
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
    dist_index = Path("frontend/dist/index.html")
    if dist_index.exists():
        return FileResponse(dist_index)
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/calculate", response_model=CalculationResponse)
async def calculate(data: CalculationRequest):
    annual_revenue = data.kpi.mrr * 12
    ltv = data.kpi.arpu / max(data.kpi.churn_rate, 1e-6)
    # Simple marketing conversion assumptions
    conversions = (data.marketing.marketing_spend / max(data.marketing.cost_per_lead, 1e-6)) * data.marketing.conversion_rate
    cac = data.marketing.marketing_spend / max(conversions, 1e-6)
    return CalculationResponse(annual_revenue=annual_revenue, ltv=ltv, cac=cac)
