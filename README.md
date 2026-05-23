# PinIt

A Pinterest-like platform for discovering, creating, and organizing pins on boards.

## Stack

| Layer    | Tech                                             |
|----------|--------------------------------------------------|
| Frontend | Vite, React 18, React Router 7, TypeScript, pnpm |
| Backend  | Django 5, Django REST Framework, Python 3        |
| Database | PostgreSQL 13                                    |
| Storage  | AWS S3 (pin images)                             |
| Search   | Elasticsearch 8                                  |

## Structure

```
pinit/
├── backend/         # Django REST API
├── frontend/        # Vite + React SPA
├── e2e-tests-web/   # Playwright end-to-end tests
├── infra/           # Terraform + Kubernetes manifests for AWS deployment
└── nginx/           # CORS proxy config for local S3 mock
```

## Running locally

Start the full stack with Docker Compose:

```bash
make up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

This single command handles everything: database migrations, local S3 mock setup (via Moto), Elasticsearch index setup, and starting all services. No additional steps are required. Search is backed by Elasticsearch (auto-started with `make up`).

### Seeding

To populate the database and search index with realistic test data on first run:

```bash
make seed
```

This creates 100 accounts, 1,000 pins, and 100 boards in PostgreSQL. Each pin is also indexed into Elasticsearch automatically via Django signals as it is created.

On every subsequent `make up`, the backend runs `index_all_pins` at startup, which rebuilds the Elasticsearch index from whatever is currently in the database. This keeps the two stores in sync across restarts without any manual steps.

To access the Django admin at http://localhost:8000/admin, create a superuser once the containers are running:

```bash
docker compose exec backend python manage.py createsuperuser
```

## Testing

```bash
make test-backend    # Django unit tests
make test-frontend   # Jest unit tests
make test-e2e        # Playwright E2E tests
```

See each folder's `README` for details.
