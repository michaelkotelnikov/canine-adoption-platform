# OpenShift samples

These manifests illustrate a minimal **Deployment** + **Service** + **Route** for the API and frontend. **Image references default to [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)** (`ghcr.io`): production images are built and pushed by [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) on **push to `master`**. Replace `your-github-namespace/your-repo` in each `image` with your GitHub owner and repository name in **lowercase** (same path as `github.com/owner/repo`). Adjust resource limits and secrets for your cluster.

- Images are built from the UBI-based `Dockerfile` files in `backend/` and `frontend/` with **`/app` owned root:0 and `chmod -R g=u`** so they run correctly under the **arbitrary UID** assigned by the **restricted / restricted-v2** SCC (supplemental **GID 0**).
- Set `DATABASE_URL`, `JWT_SECRET`, `MISTRAL_API_KEY`, and `NEXT_PUBLIC_API_URL` via Secrets or ConfigMaps.
- Use a managed PostgreSQL service or a separate StatefulSet for production data.
