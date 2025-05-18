# Catona Climate Customer Dashboard (Prototype)

This repository contains a simple prototype dashboard for modeling subscription revenue. The project now includes a small FastAPI backend that powers the calculation API used by the frontend.

## Running Locally

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd financial-modeling-tool
   ```
2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **(Optional) Build the frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```
4. **Start the FastAPI server**
   ```bash
   uvicorn backend.app.main:app --reload
   ```
5. **Open the app**
   Visit [http://localhost:8000/](http://localhost:8000/)

The backend serves `frontend/index.html` and exposes both `/api/kpis` and `/api/calculate` for the dashboard.

The old static prototype located at `templates/index.html` has been removed so the project only has one entry point.

If you only need a static preview without API functionality you can still run
`python3 -m http.server 8000` and open `frontend/index.html`, but the API calls
will fail in that mode.

## Deployment

For a production setup build the frontend assets first:

```bash
cd frontend
npm install
npm run build
cd ..
```

Starting the server normally will then use the bundled files in `frontend/dist`:

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```


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

## Deployment

To run in production, first build the frontend so the bundled assets are available:

```bash
cd frontend
npm install
npm run build
cd ..
```

Start the API without reload:

```bash
uvicorn backend.app.main:app
```

When the `frontend/dist` folder is present the backend automatically serves `index.html` and asset files from that directory.

## Debug Report

Run `python tools/debug_report.py` to print helpful environment information. The script reports the Python version, installed packages, Node and npm versions, and values of key environment variables such as `CORS_ALLOW_ORIGINS`. The output is plain text so it can be easily copied into bug reports.

