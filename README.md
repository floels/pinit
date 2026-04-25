# Pinit

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
└── e2e-web/    # Playwright end-to-end tests
```

## Running locally

Start the database, backend, and frontend together with Docker Compose. No setup required — pin image uploads are disabled without S3 credentials, but the rest of the app works:

```bash
docker compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

To enable S3 image uploads, add your credentials before starting:

```bash
cp .env.example .env   # fill in S3_PINS_BUCKET_UPLOADER_* values
docker compose up
```

## Testing

### Django unit tests

```bash
docker compose -f backend/docker-compose.test.yml up -d
docker compose -f backend/docker-compose.test.yml exec web python manage.py migrate
docker compose -f backend/docker-compose.test.yml exec web python manage.py test
docker compose -f backend/docker-compose.test.yml down
```

### Jest unit tests

```bash
cd frontend && pnpm install && pnpm test
```

### Playwright E2E tests

```bash
cd e2e-web && pnpm install && pnpm test
```

The test runner automatically starts the required Docker services, runs migrations, and seeds the database.

## License

Apache 2.0 — see [LICENSE](LICENSE).
