# PinIt

A Pinterest-like platform for discovering, creating, and organizing pins on boards.

PinIt ships **two frontends** on top of a shared backend API:

- a **web** app (Vite + React SPA) in [`web/`](web/) — formerly `frontend/`
- a **mobile** app (Expo / React Native, iOS + Android) in [`mobile/`](mobile/)

## Stack

| Layer          | Tech                                             |
|----------------|--------------------------------------------------|
| Web frontend   | Vite, React 18, React Router 7, TypeScript, pnpm |
| Mobile frontend| Expo (React Native 0.73), TypeScript, Yarn       |
| Backend        | Django 5, Django REST Framework, Python 3        |
| Database       | PostgreSQL 13                                    |
| Storage        | AWS S3 (pin images)                             |
| Search         | Elasticsearch 8                                  |

## Structure

```
pinit/
├── backend/         # Django REST API (shared by both frontends)
├── web/             # Web frontend — Vite + React SPA
├── mobile/          # Mobile frontend — Expo (React Native) iOS/Android app
├── e2e-tests-web/   # Playwright end-to-end tests (web)
├── infra/           # Terraform + Kubernetes manifests for AWS deployment
└── nginx/           # CORS proxy config for local S3 mock
```

Each frontend has its own README with detailed instructions: [`web/README.md`](web/README.md)
and [`mobile/README.md`](mobile/README.md).

## Running locally

Start the backend and the **web** app with Docker Compose:

```bash
make up
```

- Web app: http://localhost:3000
- Backend API: http://localhost:8000/api

This single command handles everything: database migrations, local S3 mock setup (via Moto), Elasticsearch index setup, and starting all services. No additional steps are required. Search is backed by Elasticsearch (auto-started with `make up`).

The **mobile** app is not part of the Docker Compose stack — it runs on the iOS Simulator / Android emulator and connects to the same backend. See [Mobile app (iOS)](#mobile-app-ios) below.

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

### Mobile app (iOS)

The mobile app is an [Expo](https://expo.dev/) (React Native) project in `mobile/`. It talks to
the same backend API at `http://127.0.0.1:8000/api` (from the iOS Simulator, `127.0.0.1` resolves to
your Mac, so the Dockerized backend is reachable). Start the backend first, then launch the app:

```bash
make up          # start the backend (and the rest of the stack)
make mobile-ios  # install deps, start Metro, and open the app in the iOS Simulator
```

`make mobile-ios` runs `expo start --ios`, which opens the app in Expo Go. The mobile app uses
Yarn Classic (v1); the Makefile targets pin it via Corepack so they work regardless of the Yarn
version on your `PATH`. See [`mobile/README.md`](mobile/README.md) for prerequisites, Android/web
targets, and other scripts.

## Testing

```bash
make test-backend    # Django unit tests
make test-web        # Jest unit tests (web app)
make test-mobile     # Jest unit tests (mobile app)
make test-e2e        # Playwright E2E tests (web)
```

See each folder's `README` for details.
