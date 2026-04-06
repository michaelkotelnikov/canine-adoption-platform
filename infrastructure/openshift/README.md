# OpenShift samples

These manifests illustrate a minimal **Deployment** + **Service** + **Route** for the API and frontend. Replace image references, resource limits, and secrets with values appropriate for your cluster.

- Images are built from the UBI-based `Dockerfile` files in `backend/` and `frontend/` with **`/app` owned root:0 and `chmod -R g=u`** so they run correctly under the **arbitrary UID** assigned by the **restricted / restricted-v2** SCC (supplemental **GID 0**).
- Set `DATABASE_URL`, `JWT_SECRET`, `MISTRAL_API_KEY`, and `NEXT_PUBLIC_API_URL` via Secrets or ConfigMaps.
- Use a managed PostgreSQL service or a separate StatefulSet for production data.

Apply with `oc apply -k .` if you add a `kustomization.yaml`, or apply files individually after editing placeholders.
