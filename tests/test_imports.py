import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_backend_main_importable_from_root():
    subprocess.check_call([sys.executable, "-m", "backend.main"], cwd=ROOT)


def test_backend_main_importable_from_subdir():
    subdir = ROOT / "frontend"
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT)
    subprocess.check_call([sys.executable, "-m", "backend.main"], cwd=subdir, env=env)
