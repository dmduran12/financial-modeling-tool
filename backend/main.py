from fastapi import FastAPI
from typing import List

# Reuse the data models and handlers from the full application
from backend.app.main import (
    KPI,
    CalculationRequest,
    CalculationResponse,
    health,
    get_kpis,
    calculate,
)

app = FastAPI(title="Catona API")

# Register the minimal API routes
app.add_api_route(
    "/api/kpis",
    get_kpis,
    methods=["GET"],
    response_model=List[KPI],
)

app.add_api_route(
    "/api/calculate",
    calculate,
    methods=["POST"],
    response_model=CalculationResponse,
)

app.add_api_route("/api/health", health, methods=["GET"])
