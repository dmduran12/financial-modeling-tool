#!/usr/bin/env python3
"""Convenience script to run the development server."""
import os
import sys
from pathlib import Path
import uvicorn

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))


def main():
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)


if __name__ == "__main__":
    main()
