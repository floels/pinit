# PinIt

A Pinterest-like platform for discovering, creating, and organizing pins on boards.

PinIt ships **two frontends** on top of a shared backend API:

- a web app (Vite + React SPA),
- an iOS app (Expo / React Native).

## Table of contents

- [Stack](#stack)
- [Repo structure](#repo-structure)
- [Local setup](#local-setup)
  - [First run](#first-run)
  - [Local S3 mock and nginx](#local-s3-mock-and-nginx)
  - [Launching the API](#launching-the-api)
  - [Launching the web app](#launching-the-web-app)
  - [Launching the iOS app](#launching-the-ios-app)
- [Testing](#testing)
- [Continuous integration](#continuous-integration)

## Stack

| Layer           | Tech                                                  |
|-----------------|-------------------------------------------------------|
| Web frontend    | Vite 8, React 19, React Router 8, TypeScript, pnpm    |
| Mobile frontend | Expo 57 (React Native 0.86), TypeScript, Yarn Classic |
| Backend         | Django 6, Django REST Framework, Python 3.12          |
| Database        | PostgreSQL 17                                         |
| Storage         | AWS S3 (pin images); Moto (local S3 mock)             |
| Search          | Elasticsearch 8                                       |

## Repo structure

```
pinit/
├── backend/         # Django REST API
├── web/             # Web frontend — Vite + React SPA
├── mobile/          # Mobile frontend — Expo (React Native) iOS/Android app
├── e2e-tests-web/   # Playwright end-to-end tests (web)
├── scripts/         # Shared E2E backend startup script
├── infra/           # Terraform + Kubernetes manifests for AWS deployment
└── nginx/           # CORS proxy for the local S3 mock (see below)
```

Each sub-project has its own README: [`backend/README.md`](backend/README.md), [`web/README.md`](web/README.md), [`mobile/README.md`](mobile/README.md), and [`e2e-tests-web/README.md`](e2e-tests-web/README.md).

## Local setup

All commands below rely on Docker — make sure your Docker client is running before proceeding.

### First run

After cloning, start the backend stack, create a Django superuser, and seed the database:

```bash
make launch-backend
docker compose -f docker-compose.local.yml exec backend python manage.py createsuperuser
make seed
```

`make seed` creates 100 accounts, 1,000 pins, and 100 boards in PostgreSQL and indexes them into Elasticsearch. Database contents persist across restarts in a Docker named volume, so seeding is only needed once. On every subsequent launch, the backend re-indexes all pins into Elasticsearch automatically.

### Local S3 mock and nginx

In production, pin images are uploaded directly from the browser to AWS S3 via pre-signed URLs. Locally, S3 is replaced by [Moto](https://docs.getmoto.org/), but Moto does not add CORS headers to pre-signed URLs, which causes the browser to block uploads. A thin nginx reverse proxy sits in front of Moto and injects the necessary headers:

```
┌─────────┐  ① request pre-signed URL  ┌──────────────┐
│         │ ─────────────────────────▶ │  Django API  │
│ Browser │ ◀───────────────────────── │  :8000       │
│         │  ② URL pointing to :5555   └──────────────┘
│         │
│         │  ③ PUT image to :5555      ┌──────────────┐  ④ forward   ┌──────────────┐
│         │ ─────────────────────────▶ │  nginx       │ ───────────▶ │  Moto        │
└─────────┘                            │  :5555       │              │  (S3 mock)   │
                                       │  +CORS hdrs  │              └──────────────┘
                                       └──────────────┘
```

No configuration is required — `make launch-backend` starts both Moto and the nginx proxy automatically. Note that Moto has no persistent volume, so uploaded images are lost on restart; the backend re-runs `set_up_moto` at startup to reinitialise the bucket.

### Launching the API

To start the backend stack (Django, PostgreSQL, Elasticsearch, Moto, and the nginx CORS proxy) in detached mode, run:

```bash
make launch-backend
```

The API will be available at http://localhost:8000/api. To access the Django admin at http://localhost:8000/admin, create a superuser once the containers are running (see [First run](#first-run) above).

### Launching the web app

To start the full stack (backend + web frontend) in detached mode, run:

```bash
make launch-web
```

The web app will be available at http://localhost:3000, and the backend API at http://localhost:8000/api.

### Launching the iOS app

To start the backend stack in detached mode and launch the app in the iOS Simulator, run:

```bash
make launch-ios
```

The Expo process runs in the foreground — keep the terminal open while developing.

## Testing

To run the Django unit tests for the backend:

```bash
make test-backend
```

To run the Vitest unit tests for the web app:

```bash
make test-web
```

To run the Jest unit tests for the mobile app:

```bash
make test-mobile
```

To run the Playwright end-to-end tests against the web app:

```bash
make test-e2e
```

To run the Detox end-to-end tests against the mobile app on the iOS Simulator:

```bash
make test-e2e-mobile
```

Both E2E suites share one backend stack. `scripts/e2e-backend-up.sh` starts the
services from `docker-compose.e2e.yml`, then migrates and seeds the database.

See each folder's `README` for details.

## Continuous integration

Every pull request targeting `main` runs the
[`Check Pull Request`](.github/workflows/check-pull-request.yml) GitHub Actions workflow.
A `detect-changes` job first computes which parts of the repo changed (via path filters), and
only the affected checks then run — so a mobile-only PR won't spend time on backend or web checks,
and vice versa. Changing the workflow file itself triggers every job.

| Job | Runs when | What it does |
|-----|-----------|--------------|
| `backend-checks` | `backend/**` changed | Builds the test Docker image, runs migrations, runs the Django test suite |
| `web-checks` | `web/**` changed | `pnpm` install → lint → build → type-check → Vitest unit tests |
| `mobile-checks` | `mobile/**` changed | `yarn` install → lint → `tsc` → Jest unit tests |
| `e2e-checks` | `e2e-tests-web/**` changed | **Type-check only** |

> The **Playwright end-to-end tests are not executed in CI** — the `e2e-checks` job only
> type-checks them. Run the full E2E suite **locally** before merging changes that affect
> user-facing flows:
>
> ```bash
> make test-e2e
> ```
>
> This spins up a dedicated backend via `docker-compose.e2e.yml`, seeds it,
> starts the web dev server, and runs the Playwright specs against Chromium. Docker must be
> running, and ports `8000` and `5555` must be free (stop the local `make up` stack first if it's
> running). See [`e2e-tests-web/README.md`](e2e-tests-web/README.md) for details.
>
> The **Detox mobile tests do not run in CI either.** The `mobile-checks` job lints and
> type-checks the flows in `mobile/e2e/`, because the tests need macOS and an iOS Simulator.
> Run them locally with `make test-e2e-mobile`. See
> [`mobile/README.md`](mobile/README.md) for the prerequisites.
