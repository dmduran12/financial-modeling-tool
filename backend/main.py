from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Catona Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class KPI(BaseModel):
    name: str
    value: float

@app.get("/api/kpis", response_model=list[KPI])
def get_kpis():
    data = [
        KPI(name="Total MRR", value=256000),
        KPI(name="Annual Revenue", value=998000),
        KPI(name="Customer LTV", value=2000),
        KPI(name="Active Users", value=35)
    ]
    return data

