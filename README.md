# Catona Climate Customer Dashboard (Prototype)

This repository contains a simple prototype dashboard for modeling subscription revenue. It is a pure static build (HTML/CSS/JS) that can be served with any HTTP server. No backend is required.

## Running Locally

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd financial-modeling-tool
   ```
2. **Start a local server**
   Using Python 3:
   ```bash
   python3 -m http.server 8000
   ```
3. **Open the app**
   Visit [http://localhost:8000/templates/index.html](http://localhost:8000/templates/index.html)

The page will load the CSS from `static/css` and JavaScript from `static/js`.

## Notes

- The `static/js/model` directory contains minimal placeholder business logic to demonstrate calculations.
- Brand tokens are defined in `static/css/brand-tokens.css` and include the full Catona color palette and design variables.
- This is not a production‑ready build but serves as a foundation for further development.
