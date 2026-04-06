# Infrastructure (`infrastructure/`) — agent instructions

## Deployment and containerization

- Optimize for **Red Hat OpenShift** expectations: manifests, image references, and security practices should align with cluster policies where this repo defines them.

## Dockerfiles and UBI

- For **OpenShift-friendly container security**, base images in Dockerfiles should use **Red Hat Universal Base Images (UBI)** unless the monorepo documents a required exception.

## Non-root and arbitrary UID

- During image build, you may **temporarily** use **`USER 0`** (root) only for steps that require elevated privileges—typically **installing OS packages and application dependencies** and **normalizing filesystem permissions**.
- Production app content under **`/app`** should be **root-owned (UID 0)** with **group 0**, then **`chgrp -R 0 /app && chmod -R g=u /app`** so any runtime process with **supplemental GID 0** can read and execute (and write where group bits allow). **Do not** rely on a fixed numeric **`USER`** in the image for OpenShift: the platform assigns the effective UID.
- **Do not** end the Dockerfile with **`USER 0`** for workloads meant to run on OpenShift under **restricted** SCCs; omit a final **`USER`** or rely on the base image default only if it is non-root and compatible with arbitrary UID. For **local Docker**, run with **`docker run --user <uid>:0`** or let Compose use defaults.
- The **frontend dev** image keeps **`USER 0`** so **`docker-entrypoint-dev.sh`** can `chown` anonymous volumes before **`setpriv`** drops to **`CONTAINER_RUN_UID`**.
