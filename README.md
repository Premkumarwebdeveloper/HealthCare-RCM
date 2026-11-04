# HealthCare RCM – Full-Stack Application

React (Vite) + Node.js/Express + PostgreSQL implementation of the Revenue Cycle Management screens
(Login, Dashboard, Claims Details) from the reference images.

## Structure
```
rcm-app/
├── docker-compose.yml        # PostgreSQL 16 (optional)
├── backend/
│   ├── src/
│   │   ├── config/           # env validation (zod), pg pool + transaction helper
│   │   ├── db/               # migrations/*.sql, migrate.js, seed.js
│   │   ├── routes/ controllers/ services/ repositories/
│   │   ├── middleware/       # auth (JWT + roles), validate (zod), centralized errorHandler
│   │   └── validators/       # request schemas
│   └── tests/                # Jest + Supertest
└── frontend/
    └── src/
        ├── api/ context/ hooks/ utils/
        ├── components/ (layout/, charts, tables, filters, modal)
        └── pages/ (Login, Dashboard, Claims, Module placeholder, NotFound)
```

## Setup
Prerequisites: Node 18+, PostgreSQL 14+ (or Docker).

```bash
# 1. Database (skip if you already run PostgreSQL)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env          # adjust DATABASE_URL / JWT_SECRET
npm install
npm run migrate               # create schema
npm run seed                  # demo data (150 claims, 2 users)
npm run dev                   # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173  (proxies /api -> :5000)
```
Demo login: **deepa.k / Password@123** (admin) or **biller.demo / Password@123** (biller).

Production: `npm run build` in `frontend/` and serve `dist/` behind a reverse proxy that forwards `/api`
to the backend (or set `VITE_API_URL` at build time). Set `NODE_ENV=production` and a strong `JWT_SECRET`.

## Scripts
| Where | Command | Purpose |
|---|---|---|
| backend | `npm test` | Jest + Supertest API tests (repositories mocked, no DB needed) |
| backend | `npm run lint` / `npm run format` | ESLint / Prettier |
| frontend | `npm test` | Vitest unit tests |
| frontend | `npm run lint` / `npm run format` | ESLint / Prettier |

## API
All endpoints are prefixed `/api`. Except login, all require `Authorization: Bearer <token>`.
Errors: `{ "message": string, "errors"?: [{ "field", "message" }] }` with 400 (validation), 401, 403, 404, 409, 500.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Body `{ username, password, rememberMe? }` → `{ token, user }`. Token lasts `JWT_EXPIRES_IN` (7 days with rememberMe). Rate limited. |
| GET | `/auth/me` | Current user. |
| GET | `/lookups` | `{ payers, actionCodes, statusCodes }` for filter dropdowns. |
| GET | `/dashboard?days=7\|30\|90` | KPIs with % change vs previous equal period, claims-by-status (In Process counted as Pending), AR aging buckets, 5 most recently updated claims. |
| GET | `/claims` | Paginated list. Query: `patientName, claimNumber, dosFrom, dosTo (YYYY-MM-DD), payerId, status (Paid\|Pending\|Denied\|In Process), actionCode, statusCode, providerNpi, page, pageSize (10\|25\|50\|100), sortBy, sortDir`. Returns `{ data, meta: { page, pageSize, total, totalPages }, statusCounts }`. `statusCounts` ignore the status filter so the chips stay meaningful. |
| GET | `/claims/export?format=csv\|xlsx\|pdf` | Same filters as above, plus optional `ids=1,2,3` to export only selected rows. Max 10,000 rows. File download. |
| GET | `/claims/:id` | Claim detail (adds provider, status code description). |
| GET | `/health` | Liveness probe (no auth). |

## Database
`users, payers, providers, patients, action_codes, status_codes, claims` – normalized with foreign keys,
CHECK constraints (status values, `paid_amount <= billed_amount`) and indexes on DOS, status, payer,
provider, patient, `updated_at` and patient name. Migrations are tracked in `schema_migrations` and applied
inside transactions; the seed script runs in a single transaction.

## Scope notes
* Implemented end-to-end: Login, Dashboard, Claims Details (filters, status chips, sorting, row selection,
  pagination, export, claim detail dialog) and Denials (Claims view preset to Denied).
* Eligibility, Claim Status, Payments, Reports and Settings appear in the sidebar as in the reference but have no
  specification or screens, so they show a "not available" page rather than invented functionality.
* "Forgot Password?" shows guidance to contact an administrator; no email service was specified.
* Source of the Dashboard figures: claims are windowed by `updated_at`; AR = billed − paid for non-Paid claims;
  aging buckets use days since date of service.
* The login screen's photographic background is approximated with a CSS gradient (no image asset was provided).
# HealthCare-RCM
Revenue Cycle Management
