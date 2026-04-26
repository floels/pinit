# PinIt

A Pinterest-like platform for discovering, creating, and organizing pins on boards.

## Stack

| Layer    | Tech                                             |
|----------|--------------------------------------------------|
| Frontend | Vite, React 18, React Router 7, TypeScript, pnpm |
| Backend  | Django 5, Django REST Framework, Python 3        |
| Database | PostgreSQL 13                                    |
| Storage  | AWS S3 (pin images)                             |

## Structure

```
pinit/
├── backend/    # Django REST API
├── frontend/   # Vite + React SPA
└── e2e-tests-web/    # Playwright end-to-end tests
```

## Running locally

Start the database, backend, and frontend together with Docker Compose. No setup required — pin image uploads are disabled without S3 credentials, but the rest of the app works:

```bash
make up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

To populate the database with realistic test data on first run:

```bash
make seed
```

To enable S3 image uploads, add your credentials before starting:

```bash
cp .env.example .env   # fill in S3_PINS_BUCKET_UPLOADER_* values
make up
```

## Testing

```bash
make test-backend    # Django unit tests
make test-frontend   # Jest unit tests
make test-e2e        # Playwright E2E tests
```

See each folder's `README` for details.
