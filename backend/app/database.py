from typing import List
from .models import Project

fake_projects: List[Project] = [
    Project(id=1, name="Forest Restoration", location="Brazil", total_credits=1000, retired_credits=200),
    Project(id=2, name="Wind Farm", location="Texas", total_credits=500, retired_credits=50),
]
