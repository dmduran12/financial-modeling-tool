# Catona Climate Customer Dashboard (Prototype)

This repository contains a simple prototype dashboard for modeling subscription revenue. The project now includes a small FastAPI backend that powers the calculation API used by the frontend.

These instructions assume **macOS** with Python 3 available. Always invoke
`python3` to ensure you use the interpreter where dependencies like FastAPI are
installed.

## Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/dmduran12/financial-modeling-tool.git
   cd financial-modeling-tool
   ```
2. **Create and activate a virtual environment**
   ```bash
   python3 -m venv .venv && source .venv/bin/activate
   ```
3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Install Node packages**
   ```bash
   cd frontend
   npm install
   ```
5. **Build the frontend or run the dev server**
   ```bash
   npm run build      # or `npm run dev` for hot reloading
   cd ..              # return to project root if you built the assets
   ```
   Building creates the `frontend/dist` directory used when the FastAPI server
   serves the React app. If omitted, the server falls back to `frontend/index.html`.
6. **Start the FastAPI server from the project root**
   ```bash
   python3 launch.py
   ```
   *(Adjust the path if your virtual environment lives elsewhere.)* The script wraps `uvicorn` and automatically sets `PYTHONPATH` so you can run it from the project root.

   If you launch the server from another directory, set `PYTHONPATH=.` or use
   the `python3 -m` form:
   ```bash
   PYTHONPATH=. .venv/bin/uvicorn backend.app.main:app --reload
   # or
   python3 -m uvicorn backend.app.main:app --reload
   ```
   When encountering module import errors, run `python3 tools/debug_report.py`
   for diagnostic information. macOS users may see "Operation not permitted" if
   the project resides in a protected location; moving the repository to a
   regular folder such as `~/financial-modeling-tool` resolves this.
7. **Open the app**
   Visit [http://localhost:8001/](http://localhost:8001/)

The command above starts the API and serves the frontend at `http://localhost:8001/`. It also exposes `/api/kpis` and `/api/calculate` for the dashboard.

The old static prototype located at `templates/index.html` has been removed so the project only has one entry point.

If you only need a static preview without API functionality you can still run
`python3 -m http.server 8001` and open `frontend/index.html`, but the API calls
will fail in that mode.

## Deployment

For a production setup build the frontend assets first:

```bash
cd frontend
npm install
npm run build
cd ..
```

Starting the server normally uses the bundled files in `frontend/dist`. When this folder is present, the backend automatically serves `index.html` and asset files from that directory:

```bash
python3 launch.py
```
The script accepts the `PORT` environment variable if you need to override the default of `8001`.


### Environment Variables

The CORS middleware reads three optional variables to control allowed origins,
methods and headers:

```
CORS_ALLOW_ORIGINS  # e.g. "http://localhost:3000" (default)
CORS_ALLOW_METHODS  # comma separated, default "GET,POST"
CORS_ALLOW_HEADERS  # comma separated, default "Content-Type"
```

The provided defaults work well for development. In production set these
variables to match your deployed frontend host and any additional requirements.

## Running Tests

### Backend

```bash
pytest
```

### Frontend

```bash
cd frontend
npm install
npm test
```

## Notes

- The `static/js/model` directory contains minimal placeholder business logic to demonstrate calculations.
- Brand tokens are defined in `static/css/brand-tokens.css` and include the full Catona color palette and design variables.
- This is not a production‑ready build but serves as a foundation for further development.

## Prioritization Roadmap
See [docs/prioritization_roadmap.md](docs/prioritization_roadmap.md) for the feature backlog.

## Debug Report

Run `python3 tools/debug_report.py` to print helpful environment information. The script reports the Python version, installed packages, Node and npm versions, and values of key environment variables such as `CORS_ALLOW_ORIGINS`. The output is plain text so it can be easily copied into bug reports.

