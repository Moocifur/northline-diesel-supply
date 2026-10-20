# Admin panel

A React + Vite single-page app for managing the demo store: parts, users (wholesale approvals, admin rights) and orders (fulfil, cancel, core returns). Only admin accounts can use it.

It has no server of its own. It calls the API through `/api/...` on its own origin: in development the Vite dev server forwards that to the API (see `vite.config.js`), and in production Netlify does (see `netlify.toml`). That keeps the login cookie first-party.

```bash
cp .env.example .env
npm run dev --workspace=admin    # from the repo root, http://localhost:5173
```

Demo login: `admin@example.com` / `demo-admin-123` (created by the API's seed script).

See the [root README](../README.md) and [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) for the whole project.
