# -----------------------------------------------------------------------------
# development — local `next dev` with bind mounts (Compose target: development).
# Entrypoint under /usr/local/bin so ../frontend:/app does not replace it.
# App tree root:0 + g=u for arbitrary UID; entrypoint chowns volumes + setpriv (see docker-entrypoint-dev.sh).
# -----------------------------------------------------------------------------
FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS development

USER 0
WORKDIR /app

COPY docker-entrypoint-dev.sh /usr/local/bin/docker-entrypoint-dev.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-dev.sh

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN chgrp -R 0 /app && chmod -R g=u /app

USER 0
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint-dev.sh"]
CMD ["npm", "run", "dev"]

# -----------------------------------------------------------------------------
# build — production Next.js standalone build
# -----------------------------------------------------------------------------
FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS build

USER 0
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# -----------------------------------------------------------------------------
# production — arbitrary UID (supplemental GID 0); root:0 + g=u on /app
# -----------------------------------------------------------------------------
FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS production

USER 0
WORKDIR /app

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

RUN chgrp -R 0 /app && chmod -R g=u /app

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
