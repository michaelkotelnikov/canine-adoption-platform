#!/bin/bash
set -e
# Anonymous volumes for /app/.next and /app/node_modules are often root-owned.
# Run Next as CONTAINER_RUN_UID (default 1001); chown volumes so that UID can write.
# setpriv works without a /etc/passwd entry (OpenShift-style arbitrary UID).
RUN_UID="${CONTAINER_RUN_UID:-1001}"
chown -R "${RUN_UID}:0" /app/.next /app/node_modules 2>/dev/null || true

if command -v setpriv >/dev/null 2>&1; then
  exec setpriv --reuid="${RUN_UID}" --regid=0 --init-groups -- "$@"
elif command -v runuser >/dev/null 2>&1 && getent passwd "${RUN_UID}" >/dev/null; then
  exec runuser -u "$(getent passwd "${RUN_UID}" | cut -d: -f1)" -- "$@"
else
  echo "docker-entrypoint-dev: warning: could not drop privileges; running as root" >&2
  exec "$@"
fi
