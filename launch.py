#!/usr/bin/env python3
"""Convenience script to run the API server.

If ``DEV`` is set to a truthy value the server reloads on code
changes, otherwise it runs in production mode.
"""
import os
import sys
from pathlib import Path
import uvicorn

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))


def main():
    port = int(os.environ.get("PORT", 8001))
    reload = os.environ.get("DEV", "false").lower() in ("1", "true", "yes")
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
    )


if __name__ == "__main__":
    main()
