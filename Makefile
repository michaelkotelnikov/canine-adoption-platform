COMPOSE := docker compose -f infrastructure/docker-compose.yml
COMPOSE_FRONTEND_STANDALONE := docker compose -f infrastructure/docker-compose.frontend-standalone.yml

.PHONY: help up down up-frontend-standalone down-frontend-standalone migrate seed-db test lint

help: ## List Makefile targets
	@echo "Canine Adoption Platform"
	@grep -E '^[a-zA-Z0-9_-]+:.*?##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

up: ## Spin up the stack (Postgres, backend, frontend) via Docker Compose
	$(COMPOSE) up --build -d

down: ## Stop and remove Compose containers
	$(COMPOSE) down

up-frontend-standalone: ## Frontend only (mock data, no API/DB) — good for UI testing
	$(COMPOSE_FRONTEND_STANDALONE) up --build -d

down-frontend-standalone: ## Stop standalone frontend compose project
	$(COMPOSE_FRONTEND_STANDALONE) down

migrate: ## Run database schema migrations (Alembic)
	$(COMPOSE) run --rm backend alembic upgrade head

seed-db: ## Populate database with mock canine data
	$(COMPOSE) run --rm backend python -m app.seed

test: ## Run backend (pytest) and frontend (Jest) tests
	$(COMPOSE) run --rm --no-deps -e PYTEST_ADDOPTS="-o cache_dir=/tmp/pytest_cache" backend sh -c "PYTHONPATH=/app python -m pytest -q"
	cd frontend && npm test -- --passWithNoTests --watchAll=false

lint: ## Run formatters/linters (ruff, ESLint)
	$(COMPOSE) run --rm --no-deps -e RUFF_CACHE_DIR=/tmp/ruff_cache backend sh -c "cd /app && ruff check . && ruff format --check ."
	cd frontend && npm run lint

openapi-types: ## Regenerate frontend OpenAPI types (backend container writes openapi.json)
	$(COMPOSE) run --rm --no-deps -v "$(CURDIR)/frontend:/frontend_out" backend sh -c "cd /app && PYTHONPATH=/app python -c \"import json; from app.main import app; json.dump(app.openapi(), open('/frontend_out/openapi.json','w'), indent=2)\""
	cd frontend && npm run openapi:types
