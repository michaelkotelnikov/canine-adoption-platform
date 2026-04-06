# Red Hat UBI — arbitrary UID (e.g. OpenShift): app tree root:0 with g=u so supplemental GID 0 can access.
FROM registry.access.redhat.com/ubi9/python-312:latest AS base

USER 0
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chgrp -R 0 /app && chmod -R g=u /app

EXPOSE 8000

FROM base AS development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM base AS production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
