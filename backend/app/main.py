from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Catona Dashboard")

app.mount("/static", StaticFiles(directory="static"), name="static")

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

@app.get("/", response_class=HTMLResponse)
async def index():
    return FileResponse("frontend/index.html")

@app.post("/api/calculate", response_model=CalculationResponse)
async def calculate(data: CalculationRequest):
    annual_revenue = data.kpi.mrr * 12
    ltv = data.kpi.arpu / max(data.kpi.churn_rate, 1e-6)
    # Simple marketing conversion assumptions
    conversions = (data.marketing.marketing_spend / max(data.marketing.cost_per_lead, 1e-6)) * data.marketing.conversion_rate
    cac = data.marketing.marketing_spend / max(conversions, 1e-6)
    return CalculationResponse(annual_revenue=annual_revenue, ltv=ltv, cac=cac)
