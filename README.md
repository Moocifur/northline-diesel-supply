# Northline Diesel Supply: a full-stack demo parts store

A working e-commerce store for a **fictional** diesel parts business, built as a portfolio project. There are no real payments, and nothing is shipped. The point is the logic behind the storefront: wholesale pricing, live inventory, refundable core charges, an order lifecycle and an admin panel.

> **Live demo:** _add your storefront link here_ · **Admin panel:** _add your admin link here_

## Try it

Log in with a demo account (the login pages have click-to-fill buttons):

| Account | Email | Password | What it shows |
| --- | --- | --- | --- |
| Wholesale customer | `wholesale@example.com` | `demo-wholesale-123` | 20% off, shown in the catalog, cart and orders |
| Regular customer | `customer@example.com` | `demo-customer-123` | Regular prices |
| Admin | `admin@example.com` | `demo-admin-123` | Everything in the admin panel |

A good tour: browse the catalog as the wholesale customer, place an order, then sign in to the admin panel as the admin, fulfil or cancel it, and watch the stock and core-return status change.

## What it demonstrates

- **Wholesale pricing.** Business customers apply, an admin approves them and sets a discount. The discounted price is calculated on the server and is never sent to anyone who is not approved.
- **Live inventory.** Stock is checked and claimed inside one database transaction at checkout, so the last unit can never be sold twice. Cancelling an order puts the stock back.
- **Core charges.** Rebuildable parts carry a refundable core charge, tracked from pending to refunded.
- **Order lifecycle.** Orders move `PAID → FULFILLED` or `CANCELLED`, driven by a small state machine that the admin UI reads from the API.
- **Secure sessions.** The storefront keeps the login token in an httpOnly cookie behind a backend-for-frontend layer. Admin rights are checked in the database on every request, not trusted from the token.
- **Supplier stock feed.** A token-protected CSV endpoint that a supplier could pull on a schedule.

## How it is built

| Part | Folder | Tech |
| --- | --- | --- |
| Storefront | [`storefront/`](storefront) | Next.js (App Router), React, Tailwind CSS |
| API | [`api/`](api) | Express 5, Prisma, PostgreSQL |
| Admin panel | [`admin/`](admin) | React, Vite, React Router, Tailwind CSS |

It is an npm-workspaces monorepo. See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for diagrams, the request flows, a reading order for the code and where each business rule is enforced.

## Run it locally

You need Node.js 22+ and a local PostgreSQL.

```bash
# 1. install everything
npm install

# 2. create the database
createdb demo_shop

# 3. environment files (then edit them: set JWT_SECRET, check DATABASE_URL)
cp api/.env.example api/.env
cp storefront/.env.example storefront/.env.local
cp admin/.env.example admin/.env

# 4. create the tables and load the demo data
cd api
npx prisma migrate deploy
npm run db:seed
cd ..

# 5. start the three apps (each in its own terminal)
npm run dev:api          # http://localhost:4000
npm run dev:storefront   # http://localhost:3000
npm run dev:admin        # http://localhost:5173
```

`npm run db:seed --workspace=api` wipes and reloads the demo data, so you can re-run it any time to reset. It refuses to touch a non-local database unless you add `-- --remote`.

## Tests

```bash
npm test
```

34 tests cover the pricing maths, order building, input validation, the order status rules and the checkout flow (stock claiming, rollback, cancelling). The checkout tests use an in-memory stand-in for the database, so they run without Postgres. They check the logic, not Prisma's query syntax.

## Deploying

The API and database go on [Render](https://render.com), the two frontends on [Netlify](https://netlify.com).

**API + database (Render)**

1. Create a PostgreSQL database.
2. Create a web service from this repo with the build command `npm install --workspace=api && npm run build --workspace=api` and the start command `npm run start:prod --workspace=api` (it applies migrations, then starts the server). Set the health check path to `/health`.
3. Environment variables: `DATABASE_URL` (the database's internal URL), `JWT_SECRET` (a long random string), `NODE_ENV=production`, `SUPPLIER_FEED_TOKEN`.
4. Load the demo data once, from your machine, using the database's _external_ URL (hosted databases usually need `?sslmode=require` on it):

   ```bash
   DATABASE_URL="<external url>" npm run db:seed --workspace=api -- --remote
   ```

**Storefront (Netlify)**: set the base directory to `storefront`. Environment variables: `API_URL` (your Render service URL) and, optionally, `NEXT_PUBLIC_ADMIN_URL` (the admin's URL, used for links).

**Admin (Netlify)**: set the base directory to `admin`. Open [`admin/netlify.toml`](admin/netlify.toml) and replace `YOUR-API` with your Render service name. That redirect is what keeps the admin's login cookie first-party, so it works in Safari and other browsers that block third-party cookies. Set `VITE_API_URL=/api`.

Free hosting tiers sleep when idle, so the first request after a quiet spell can be slow. Check each provider's current free-tier limits before relying on them.

## Design decisions worth talking about

- **Prices never come from the client.** The cart shows prices for convenience, but checkout recomputes everything from the database. A tampered cart cannot change what is charged.
- **Money uses a decimal library, never floating-point numbers**, and is stored as `Decimal` in Postgres.
- **One conditional `UPDATE` claims stock** (`WHERE quantityOnHand >= qty`) inside a transaction. That is race-safe without locks, and a failure on any line rolls the whole order back.
- **Pure functions for the rules** (`api/src/services/`): pricing, the order state machine and validation take plain data and return plain data, so they are easy to test and to read.
- **The token proves who you are, not what you may do.** Roles and wholesale status are looked up on each request, so revoking access applies immediately.
- **A backend-for-frontend layer** in the Next.js app keeps the token out of browser JavaScript entirely.

## Known limitations and what I would do next

- No payment processor. Orders are marked paid immediately; a real version would start them as `PENDING_PAYMENT` and confirm via a Stripe webhook.
- No rate limiting on login, and no password reset or email verification.
- Part images are external URLs; there is no upload flow.
- The checkout tests do not run against a real Postgres. Integration tests against a throwaway database would be the next step.
- The contact form is a demo and does not send anything.
