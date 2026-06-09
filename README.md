# Forsa — Public App (FCA-safe market intelligence)

A separate React frontend for the public, data-only Forsa product. It shares the
existing Railway bridge backend with the admin app but contains **no** trade-idea,
verdict, or directional-recommendation logic. It serves neutral signal states and
verified historical context only.

## Stack
- Vite + React 18
- React Router
- Recharts (charts)
- Talks to the shared Railway bridge via `/auth/*` and `/public/*`

## Local development
```bash
npm install
cp .env.example .env        # set VITE_BRIDGE_URL to your Railway bridge URL
npm run dev                 # http://localhost:5174
```

## Deploy (new Vercel project)
1. Push this folder to a **new GitHub repo**.
2. In Vercel: New Project → import that repo.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
4. Add env var `VITE_BRIDGE_URL` = your Railway bridge URL.
5. Deploy.

## Backend requirement
On the Railway **web service**, add this app's Vercel domain to the
`ALLOWED_ORIGINS` env var (comma-separated) so CORS permits it. No other backend
change is needed — the `/public/*` and `/auth/*` endpoints already exist.

## Data dependency
The dashboard, markets, and patterns pages read the `sighist:` dataset produced by:
- `forsa_backfill_history.py` (one-off deep historical backfill), and
- `forsa_snapshot_logger.py` (daily ongoing capture in the autoloop).

Until those have populated data, pages will show a "history building" state.

## Routes
- `/` landing
- `/login`, `/register` — shared-bridge auth
- `/dashboard` — global market overview (F&G, regime, on-chain)
- `/markets`, `/markets/:sym` — per-coin neutral signal states + price
- `/patterns` — historical pattern context ("when conditions looked like this before")

## Design notes
Refined dark "data terminal" aesthetic. Fraunces (display) + Spline Sans Mono
(data) + Outfit (body). Single ember accent. Neutral state colours are
cool/warm/mid — deliberately **not** red/green buy-sell signalling.
