from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import projects

app = FastAPI(title="Catona Climate Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)

app.include_router(projects.router, prefix="/api/projects", tags=["projects"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
