from fastapi import APIRouter, HTTPException
from typing import List
from ..models import Project
from ..database import fake_projects

router = APIRouter()

@router.get("/", response_model=List[Project])
async def list_projects():
    return fake_projects

@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: int):
    for project in fake_projects:
        if project.id == project_id:
            return project
    raise HTTPException(status_code=404, detail="Project not found")
