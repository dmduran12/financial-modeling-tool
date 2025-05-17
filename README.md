# Catona Climate Dashboard

This is a minimal full-stack demo implementing a basic dashboard with FastAPI and Preact + Tailwind CSS.

## Running Locally

1. **Install Python dependencies**
   ```bash
   pip install fastapi uvicorn jinja2
   ```

2. **Start the server**
   ```bash
   uvicorn backend.app.main:app --reload
   ```

3. **Open the app**
   Visit [http://localhost:8000](http://localhost:8000) in your browser.

The front-end uses CDN hosted libraries, so no Node.js setup is required.
