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

This repository contains a minimal prototype of the Catona Climate customer dashboard.
It demonstrates a FastAPI backend and a React + Tailwind frontend.

## Requirements
- Python 3.10+
- Node.js 18+

## Setup

1. **Install backend dependencies**
   ```bash
   pip install fastapi uvicorn[standard]
   ```
2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

## Running locally

Start the backend API:
```bash
uvicorn backend.main:app --reload
```

In another terminal, start the frontend dev server:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to view the dashboard. The frontend proxies API requests to the backend running on port 8000.

