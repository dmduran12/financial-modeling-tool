# Project Agend

This document tracks the current components and launch instructions for the prototype dashboard.

## Components

- **Backend**: FastAPI application in `backend/` exposing KPI, marketing audit, and projection endpoints.
- **Frontend**: React app built with Vite located in `frontend/`.
- **Tests**: Backend tests under `tests/` run with `pytest`; frontend uses Jest.
- **Utilities**: `tools/debug_report.py` prints environment information.

## Launching

Install Python and Node dependencies, build the frontend, then run:

```bash
python3 launch.py
```

The script starts `uvicorn` and serves the bundled frontend on port 8001 by default.
Set the `PORT` environment variable to override the port.

