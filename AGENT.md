# AGENT Guidelines for financial-modeling-tool

Welcome, automated contributor! This project welcomes assistance from AI agents as well as humans. Please keep the following in mind when preparing changes or pull requests.

## Testing

- Run `pytest` from the repository root to execute backend tests.
- For frontend tests, run `npm test` from the `frontend/` directory. These commands may fail if dependencies are not installed. If that happens, mention the issue in your PR description.

## Style

- Format Python code with `black` using the default configuration.
- Keep commit messages concise: a short summary in the imperative mood.
- When modifying JavaScript or TypeScript, run `npx prettier --write` on the changed files.

## Frontend Layout
- Use the `content-header` class for section headers to match the dashboard style.
- Maintain vertical rhythm using `space-y-*` utilities instead of ad-hoc margins.
- The main page order is: sidebar inputs, KPI section, charts, funnel metrics, then the equation summary.

## Pull Requests

- Provide a high level summary of what changed.
- Include the results of running the test commands. If you could not run them, explain why (for example, missing dependencies in the environment).
- Note any TODOs or follow ups separately in a "Notes" section.

## Dashboard Layout

- KPI cards appear below the sidebar controls in a two-column grid (2×3).
- Each card has a `squid-ink` (#131312) background, pearl labels, and Limelight
  (#95E976) metric text. Sparklines are omitted.
- Use the `kpiRow` id on the container so CSS can apply the correct flex/grid
  behavior.
- Charts follow the KPI section, then the funnel metrics table, and finally the
  Model Equations list.
- A Funnel Metrics table lists Impr, Clicks, Leads, NewCust, BlendedCPL, and
  BlendedCVR for the first three months.

Thank you for your contributions, and happy coding!
