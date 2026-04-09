# Canine Adoption Platform

Monorepo for a public dog-browsing site with **FastAPI** + **PostgreSQL**, **Next.js (App Router)**, and **Mistral** LLM features (streaming overview + chat).

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

## OpenShift (demo deployment)

These steps walk through a **demo-only** deployment: one namespace, sample PostgreSQL, and the manifests under [`infrastructure/openshift/`](infrastructure/openshift/). Application images are **not** built or mirrored into the OpenShift integrated registry here: they are **published to GitHub Container Registry (GHCR)** by CI. For security and SCC notes on the sample manifests, see [infrastructure/openshift/README.md](infrastructure/openshift/README.md).

### Prerequisites

- [OpenShift CLI](https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/cli_tools/openshift-cli-oc) (`oc`) configured for your cluster
- Permission to create a project/namespace, Deployments, Services, Routes, and Secrets
- A **successful run** of [`.github/workflows/ci.yml`](.github/workflows/ci.yml) on **`master`** so `backend` and `frontend` images exist on GHCR (pull requests only build; **push** to `master` runs `docker push`). The image path is `ghcr.io/<lowercase_github_owner>/<lowercase_repo_name>/backend` and `.../frontend`, tags `latest` and the commit SHA (see the workflow file).

### 1. Project

```bash
oc new-project canine-demo
```

### 2. Deploy PostgreSQL for testing

You need a PostgreSQL instance the API can reach on port **5432**, plus a database name, user, and password. Choose **one** of the following.

**A. Developer perspective (web console)** — good for a first pass

1. Switch to **Developer**, select your project, then **+Add** → **Database** (or **Catalog** → **Databases**).
2. Choose **PostgreSQL** (ephemeral is fine for a throwaway demo; persistent if you want data to survive pod restarts).
3. Set database name, user, and password; deploy and wait until the database workload is **Ready**.

Note the **Service** name OpenShift creates (e.g. `postgresql` or a generated name). The hostname from any pod in the same namespace is `SERVICE_NAME` (short form) or `SERVICE_NAME.canine-demo.svc.cluster.local`.

**B. CLI with a cluster template** — if templates exist in `openshift`

```bash
oc get templates -n openshift | grep -i postgres
```

If you see e.g. `postgresql-persistent` or `postgresql-ephemeral`, instantiate it with parameters for user, password, database, and service name (follow `oc process --parameters -n openshift <template-name>`). Wait until the database deployment is available.

**C. CLI from the Red Hat PostgreSQL image** — when no template is available

Adjust the image reference if your cluster mirrors Red Hat registries differently.

```bash
oc new-app --name=postgresql \
  -e POSTGRESQL_USER=canine \
  -e POSTGRESQL_PASSWORD='replace-with-a-strong-demo-password' \
  -e POSTGRESQL_DATABASE=canine \
  registry.redhat.io/rhel9/postgresql-16:latest
oc rollout status deployment/postgresql --timeout=180s
```

### 3. Verify the database instance

Confirm the pod is running and the Service exists:

```bash
oc get pods -l app=postgresql
oc get svc postgresql
```

If your labels differ, use `oc get pods` and `oc get svc` and identify the PostgreSQL workload. Optional: from a debug pod in the same namespace, test TCP connectivity to `postgresql:5432`.

### 4. Application images on GHCR

Use the images your pipeline publishes (after merging to `master`), for example:

- `ghcr.io/michaelkotelnikov/canine-adoption-platform/backend:latest`
- `ghcr.io/michaelkotelnikov/canine-adoption-platform/frontend:latest`

### 5. Create the application Secret

The backend manifest expects a Secret named `canine-secrets` with keys `database-url`, `jwt-secret`, and optionally `mistral-api-key` (see [`infrastructure/openshift/backend-deployment.yaml`](infrastructure/openshift/backend-deployment.yaml)).

Build **`DATABASE_URL`** in the same form as [`.env.example`](.env.example): async SQLAlchemy URL with the **asyncpg** driver. Use the **Kubernetes DNS name** of the database Service so traffic stays inside the cluster (same namespace: service name only is enough).

Example (password and service name must match what you deployed):

```bash
oc create secret generic canine-secrets \
  --from-literal=database-url='postgresql+asyncpg://canine:replace-with-a-strong-demo-password@postgresql:5432/canine' \
  --from-literal=jwt-secret='replace-with-a-long-random-string' \
  --from-literal=mistral-api-key=''
```

If you omit AI features, you can leave `mistral-api-key` empty; the sample Deployment marks that key optional.

### 6. Edit OpenShift manifests

1. In [`infrastructure/openshift/backend-deployment.yaml`](infrastructure/openshift/backend-deployment.yaml), set the `image` to your GHCR backend image (see [Application images on GHCR](#4-application-images-on-ghcr)).
2. Set **`CORS_ORIGINS`** to the **public HTTPS origin** of the frontend Route (you can update this after you create the frontend Route in the next steps).
3. In [`infrastructure/openshift/frontend-deployment.yaml`](infrastructure/openshift/frontend-deployment.yaml), set the `image` to your GHCR frontend image.
4. Set **`PUBLIC_API_URL`** to the **public HTTPS base URL** of the API (browser-accessible), e.g. `https://canine-backend-canine-demo.apps.example.com` — no trailing slash. This is read **at runtime** on the Next.js server (injected for the browser via a small inline script in the layout), so you do **not** need to rebuild the frontend image when the API Route URL changes. `NEXT_PUBLIC_API_URL` is still supported as a fallback for local dev.

Optional: for Next.js server-side requests, add an env var **`API_URL`** pointing at the in-cluster Service (e.g. `http://canine-backend:8000`) so RSC traffic does not leave the cluster; if unset, the app falls back to `PUBLIC_API_URL` or `NEXT_PUBLIC_API_URL` (see [`frontend/src/lib/api/client.ts`](frontend/src/lib/api/client.ts)).

### 7. Apply workloads and expose the API

The repository sample includes a Route for the **frontend** only. Expose the **backend** Service so browsers and `PUBLIC_API_URL` can reach it.

```bash
oc apply -f infrastructure/openshift/backend-deployment.yaml
oc apply -f infrastructure/openshift/frontend-deployment.yaml
oc expose svc canine-backend --port=8000
```

Discover hostnames:

```bash
oc get route canine-frontend -o jsonpath='{.spec.host}{"\n"}'
oc get route canine-backend -o jsonpath='{.spec.host}{"\n"}'
```

If `CORS_ORIGINS` or `PUBLIC_API_URL` were placeholders, edit the Deployments (or patch env) so **`CORS_ORIGINS`** matches `https://<frontend-route-host>` and **`PUBLIC_API_URL`** matches `https://<backend-route-host>`, then wait for a rollout.

### 8. Database migrations and seed data

Run Alembic **after** the backend Deployment is up and the Secret points at a live PostgreSQL instance:

```bash
oc rollout status deployment/canine-backend --timeout=120s
oc exec deploy/canine-backend -- alembic upgrade head
```

Optional demo data and default admin (same as local `make seed-db`; override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` if your image supports them):

```bash
oc exec deploy/canine-backend -- python -m app.seed
```

### 9. Smoke test

- Open the frontend Route URL in a browser.
- Check API health: `https://<backend-route-host>/health`
- Open API docs: `https://<backend-route-host>/docs`
- If you ran the seed step, sign in with the seeded admin credentials from [Default admin](#default-admin-after-make-seed-db) (change the password in anything beyond a lab).

### 10. Cleanup (demo)

```bash
oc delete project canine-demo
```

Ephemeral databases lose data when deleted; persistent PVCs may need separate cleanup if you created them outside this walkthrough.
