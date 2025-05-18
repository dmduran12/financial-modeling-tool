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

The backend serves `frontend/index.html` and exposes the `/api` endpoints used by the dashboard.

If you only need a static preview without API functionality you can still run
`python3 -m http.server 8000` and open `frontend/index.html`, but the API calls
will fail in that mode.

## Notes

- The `static/js/model` directory contains minimal placeholder business logic to demonstrate calculations.
- Brand tokens are defined in `static/css/brand-tokens.css` and include the full Catona color palette and design variables.
- This is not a production‑ready build but serves as a foundation for further development.
