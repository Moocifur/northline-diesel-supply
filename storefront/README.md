# Storefront

The customer-facing site, built with Next.js (App Router) and Tailwind CSS. Pages render on the server and call the API with the visitor's login token.

The `app/api/*/route.js` files are a small backend-for-frontend layer: login, register, checkout, wholesale requests and the cart refresh go through them so the token can stay in an httpOnly cookie that browser JavaScript cannot read.

```bash
cp .env.example .env.local
npm run dev --workspace=storefront    # from the repo root, http://localhost:3000
```

The fictional business details (name, address, phone) and the demo accounts live in `lib/site.js`.

See the [root README](../README.md) and [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) for the whole project.
