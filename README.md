# AssetFlow — Enterprise Asset & Resource Management

A centralized platform for any organization (office, hospital, school, factory) to track assets through their full lifecycle, allocate them conflict-free, book shared resources without overlaps, route maintenance through an approval workflow, and run structured audit cycles — with realistic role-based access control.

> Built for the Odoo Hackathon 2026.

## Highlights

- **Realistic RBAC** — signup creates an **Employee** only; roles are promoted by an Admin from the Employee Directory, enforced **server-side** (hitting the promote endpoint directly as a non-admin returns `403`).
- **Conflict-safe allocation** — an already-allocated asset can't be re-allocated; the UI shows who holds it and offers a **transfer request** instead.
- **Overlap-safe booking** — a new slot is rejected iff `newStart < existingEnd && newEnd > existingStart`; back-to-back slots (e.g. 10:00–11:00 right after 09:00–10:00) are allowed.
- **Maintenance approval chain** — `Pending → Approved → Tech Assigned → In Progress → Resolved`, no stage-skipping; asset status auto-syncs (`Approved` → Under Maintenance, `Resolved` → Available).
- **Audit cycles** — create → assign auditors → mark Verified/Missing/Damaged → close (locks the cycle and flips confirmed-missing assets to `Lost`).
- **Every asset status change is a side-effect of a real action** (never a free-form edit), routed through one internal status engine that also writes an activity log + notification.
- **Live KPI dashboard** with overdue-return highlighting.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + Tailwind CSS + React Router |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Validation | Zod (backend) |
| Tests | Vitest |

## Repository layout

```
server/   Express API — routes → services (business logic) → Prisma → Postgres
client/   React SPA — pages, components, api layer, AuthContext
```

## Run locally

### 1. Database
Point `server/.env` `DATABASE_URL` at any PostgreSQL instance.

### 2. Backend
```bash
cd server
cp .env.example .env      # set DATABASE_URL, JWT_SECRET, CLIENT_ORIGIN
npm install
npx prisma migrate dev    # create schema
npm run seed              # load demo org
npm run dev               # http://localhost:4000
```

### 3. Frontend
```bash
cd client
cp .env.example .env      # set VITE_API_URL=http://localhost:4000
npm install
npm run dev               # http://localhost:5173
```

## Demo logins (from the seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@assetflow.com | Admin@123 |
| Asset Manager | meera@assetflow.com | Password@123 |
| Department Head | arjun@assetflow.com | Password@123 |
| Employee | priya@assetflow.com | Password@123 |

## Tests

```bash
cd server && npm test
```
Covers the four highest-value pieces of logic: booking overlap, allocation conflict, maintenance state-machine transitions, and the RBAC role guard.

## Deployment

- **Frontend → Vercel:** project root `client/`, build `npm run build`, output `dist`. Set `VITE_API_URL` to the API URL. `client/vercel.json` handles SPA routing.
- **Backend + PostgreSQL → VM:** cloned to `~/assetpilot/server`, run on `:4000` via pm2 (`ecosystem.config.cjs`), backed by the VM's local PostgreSQL. Exposed over HTTPS at `https://assetpilot.duckdns.org` through a Caddy reverse-proxy. Env: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN` (the Vercel URL), `PORT=4000`. First boot: `npx prisma migrate deploy && npm run seed`.
