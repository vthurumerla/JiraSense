# JiraSense

AI-assisted Jira project companion with:

- React UI for scrum coaching, issue templates, and support workflows.
- Node.js backend for Jira standards knowledge base, suggestions, and SLA helper logic.
- Knowledge base toggle between scraped guidance and AI-generated guidance.

## Run locally

```bash
npm install
npm run dev --workspace backend
npm run dev --workspace frontend
```

Backend runs on `http://localhost:4000`, frontend on `http://localhost:5173`.

## Configuration

- Frontend API endpoint is configurable using `VITE_API_BASE` (default: `http://localhost:4000`).

## Validation

```bash
node --check backend/src/server.js
npm run test --workspace backend
```
