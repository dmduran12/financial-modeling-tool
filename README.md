# Catona Climate Dashboard

This project is a minimal full‑stack prototype for the Catona Climate customer dashboard. It uses **FastAPI** for the backend and **Preact** with **Tailwind CSS** on the frontend.

## Running Locally

1. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```
2. **Start the server**
   ```bash
   uvicorn backend.app.main:app --reload
   ```
   The server serves the static files and API at `http://localhost:8000`.
3. **Open the app**
   Visit [http://localhost:8000](http://localhost:8000) in your browser.

No Node.js setup is required because the frontend bundles Preact from a CDN.
