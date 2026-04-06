# Frontend (`frontend/`) — agent instructions

## Next.js App Router

- Always use the **`app/`** directory for routes, layouts, loading and error UI, and route handlers as appropriate.
- **Organize code by feature** (e.g. colocate components, hooks, and feature-specific utilities under feature folders) rather than dumping everything into generic `components/` or `lib/` trees without structure.

## TypeScript and React

- Use **TypeScript** strictly across the frontend.
- Prefer **functional** components. Default to **React Server Components**; add `"use client"` only when the feature requires client-only APIs or interactive state.

## Backend communication

- Ensure **end-to-end type safety** by using **openapi-fetch** for **all** backend API calls (with generated types from the OpenAPI schema when the project provides them). Avoid untyped raw `fetch` to the API unless the repo documents a specific exception.
- **Standalone preview** (`NEXT_PUBLIC_STANDALONE=1`, e.g. `make up-frontend-standalone` or `npm run dev:standalone`): use bundled mock data in `src/lib/mock-dogs.ts` for public dog routes only; keep auth/admin/AI disabled or clearly messaged—do not add a second HTTP client for production paths.

## Styling and UI

- Build interfaces **exclusively** with **Tailwind CSS** and the **Shadcn/UI** component library—no parallel styling systems or unrelated UI kits unless explicitly required by the monorepo.

## Containers

- Production **`Dockerfile`** stages use **`chgrp 0` + `chmod -R g=u`** on **`/app`** for **OpenShift-style arbitrary UID** (supplemental GID 0). Dev **`docker-entrypoint-dev.sh`** uses **`CONTAINER_RUN_UID`** (default 1001) and **`setpriv`** for `npm run dev`.
