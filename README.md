# Canine Adoption Platform

Monorepo for a public dog-browsing site with **FastAPI** + **PostgreSQL**, **Next.js (App Router)**, and optional **Mistral** LLM features (streaming overview + chat). Local orchestration uses **Docker Compose**; production-oriented images use **Red Hat UBI** and are laid out for an **arbitrary non-root UID** with **supplemental GID 0** (OpenShift-style: **`chgrp 0` + `chmod -R g=u`** on `/app`). Local `docker run` can use e.g. **`--user 10042:0`**.

## Prerequisites

- Docker and Docker Compose
- (Optional) Node 20+ and Python 3.12+ for running apps outside Compose

## Quick start

1. Copy environment defaults and adjust secrets:

   ```bash
   cp .env.example .env
   ```

   Set `JWT_SECRET` to a long random string and add a `MISTRAL_API_KEY` from [Mistral](https://console.mistral.ai/) if you want AI features.

   With the full Compose stack, the frontend service sets **`API_URL=http://backend:8000`** so React Server Components can reach the API by Docker service name. **`NEXT_PUBLIC_API_URL`** stays **`http://localhost:8000`** for calls from the browser.

   **Compose project directory** is `infrastructure/`, so a **repo-root** `.env` is **not** used for `${VAR}` substitution in the compose file. The **backend** service loads **`../.env`** via `env_file` (so `MISTRAL_API_KEY` and other secrets in the root `.env` reach the container). Alternatively, run Compose with `docker compose --env-file .env -f infrastructure/docker-compose.yml ...` from the repo root.

2. Start the stack:

   ```bash
   make up
   ```

3. Apply migrations and seed mock dogs + an admin user:

   ```bash
   make migrate
   make seed-db
   ```

4. Open the app:

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Default admin (after `make seed-db`)

- Email: `admin@example.com`
- Password: `adminpassword` (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` when running seed)

Change this password after first login in a real deployment.

## Local frontend development (host `npm run dev`)

For normal file-based editing with hot reload, run Next on the host while the API and database stay in Docker.

1. **Prerequisites:** Node 20+, then install dependencies:

   ```bash
   cd frontend && npm ci
   ```

2. **Backend:** Start Postgres and the API with `make up`, then either stop only the frontend container so port **3000** is free (`docker compose -f infrastructure/docker-compose.yml stop frontend`), or keep the full stack and run the host dev server on another port (e.g. `PORT=3001 npm run dev`).

3. **API URL:** Point the app at the local API (Compose maps it to the host as port **8000**):

   ```bash
   export NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   Or add the same line to `frontend/.env.local` (not committed).

4. **Run:**

   ```bash
   cd frontend && npm run dev
   ```

   The dev script listens on `0.0.0.0:3000` by default (see `frontend/package.json`).

For UI-only work without a backend, use `cd frontend && npm run dev:standalone` (or `make up-frontend-standalone` in Docker). See [Standalone frontend (no backend)](#standalone-frontend-no-backend).

## Standalone frontend (no backend)

To run **only** the Next app for layout/UI testing—using **bundled mock dogs** and **no** Postgres or FastAPI:

```bash
make up-frontend-standalone
```

Open [http://localhost:3000](http://localhost:3000). Auth, admin, and AI panels are disabled or show explanatory copy. Stop with `make down-frontend-standalone`.

Local equivalent (without Docker):

```bash
cd frontend && npm run dev:standalone
```

Use a different terminal port if the full stack already uses `3000` (e.g. `PORT=3001 npm run dev:standalone`).

## Makefile targets

| Target          | Description                                      |
|-----------------|--------------------------------------------------|
| `make up`       | Build and start Postgres, API, and Next dev      |
| `make down`     | Stop Compose services                            |
| `make up-frontend-standalone` | Frontend only (mock data, no API)        |
| `make down-frontend-standalone` | Stop standalone frontend project       |
| `make migrate`  | Run Alembic upgrades (`alembic upgrade head`)    |
| `make seed-db`  | Idempotent mock dogs + admin user                |
| `make test`     | Pytest (backend) + Jest (frontend)               |
| `make lint`     | Ruff (backend) + ESLint (frontend)               |
| `make openapi-types` | Export `openapi.json` and regenerate TS types |

## Project layout

- `backend/` — Async FastAPI, SQLAlchemy, Alembic, **fastapi-users** (JWT), Mistral SSE routes.
- `frontend/` — Next.js App Router, Tailwind, Shadcn/UI, **openapi-fetch** + generated types from `openapi.json`.
- `infrastructure/` — `docker-compose.yml` and OpenShift-oriented samples under `infrastructure/openshift/`.

## Regenerating API types

After changing backend routes or schemas:

```bash
make openapi-types
```

## Tests and lint

```bash
make test
make lint
```

Backend tests use an in-memory SQLite database via dependency overrides; production uses PostgreSQL only.

## OpenShift

See [infrastructure/openshift/README.md](infrastructure/openshift/README.md) for sample Deployment/Service/Route manifests (non-root, arbitrary UID / **restricted** SCC–friendly, UBI-based images).
