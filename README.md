# Financial Modeling Tool

This repository contains a small prototype for a financial dashboard. The goal is to demonstrate a simple static front end while leaving room for a future backend and build pipeline.

## Project Structure

- **frontend/** – Contains `index.html` and a React+Vite project (`src/`, `package.json`).
- **static/** – Stand‑alone JavaScript used by the static demo.
- **backend/** – Example FastAPI code for future APIs.
- **docs/** – Project documentation.
- **requirements.txt** – Python dependencies for the backend.

## Serving the Static Files

The current dashboard can be viewed without any build step. From the repository root run:

```bash
python3 -m http.server
```

Then open `http://localhost:8000/frontend/index.html` in your browser. The page loads scripts from the `static/` folder and functions entirely as a static site.

## Future Development

The repo already contains scaffolding for a more complete application. Possible next steps include:

1. **Backend API** – Expand the FastAPI app in `backend/` and connect it to a database.
2. **Frontend Build** – Use the Vite build process (`npm run build` inside `frontend/`) to produce optimized assets.
3. **Integration** – Serve the built frontend through the backend or a static hosting service.
4. **Testing & CI** – Add automated tests and continuous integration workflows.

This layout should make it straightforward to evolve from a simple static prototype into a full-stack financial modeling tool.
