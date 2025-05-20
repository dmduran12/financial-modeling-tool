# AGENT Guidelines for financial-modeling-tool

Welcome, automated contributor! This project welcomes assistance from AI agents as well as humans. Please keep the following in mind when preparing changes or pull requests.

## Testing
- Run `pytest` from the repository root to execute backend tests.
- For frontend tests, run `npm test` from the `frontend/` directory. These commands may fail if dependencies are not installed. If that happens, mention the issue in your PR description.

## Style
- Format Python code with `black` using the default configuration.
- Keep commit messages concise: a short summary in the imperative mood.
- When modifying JavaScript or TypeScript, run `npx prettier --write` on the changed files.

## Pull Requests
- Provide a high level summary of what changed.
- Include the results of running the test commands. If you could not run them, explain why (for example, missing dependencies in the environment).
- Note any TODOs or follow ups separately in a "Notes" section.

Thank you for your contributions, and happy coding!
