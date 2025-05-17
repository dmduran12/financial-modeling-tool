from pydantic import BaseModel
from typing import Optional

class Project(BaseModel):
    id: int
    name: str
    location: Optional[str] = None
    total_credits: int
    retired_credits: int
