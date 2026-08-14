# PinIt

A Pinterest-like platform for discovering and organizing pins on boards.

## Stack

| Layer      | Tech                                                          |
|------------|---------------------------------------------------------------|
| Web app    | Vite 8, React 19, React Router 8, PNPM                        |
| Mobile app | Expo 57 (React Native 0.86), React Navigation 7, Yarn Classic |
| Backend    | Django 6, Django REST Framework                               |
| Database   | PostgreSQL 17                                                 |
| Storage    | AWS S3 (pin images); Moto (local S3 mock)                     |
| Search     | Elasticsearch 8                                               |

## Top-level structure

```
pinit/
├── .github/                  # GitHub Actions CI workflows
├── backend/                  # Django REST API
├── web/                      # Web frontend — Vite + React SPA
├── mobile/                   # Mobile frontend — Expo (React Native) iOS/Android app
├── e2e-tests-web/            # Playwright end-to-end tests (web)
├── scripts/                  # Shared E2E backend startup script
├── nginx/                    # CORS proxy for the local S3 mock (see below)
├── docker-compose.local.yml  # Local Docker stack (backend, database, search, S3 mock)
├── Makefile                  # Shortcuts for the commands in this README
├── LICENSE                   # License for this project
└── .gitignore                # Files and folders that Git must not track
```

Some sub-folders has their own README: [`backend/README.md`](backend/README.md), [`web/README.md`](web/README.md), [`mobile/README.md`](mobile/README.md), and [`e2e-tests-web/README.md`](e2e-tests-web/README.md).

## Local setup

All commands below rely on Docker — make sure your Docker client is running before proceeding.

### First run

After cloning the repo, start the backend stack, create a Django superuser, and seed the database:

```bash
> make launch-backend
> docker compose -f docker-compose.local.yml exec backend python manage.py createsuperuser
> make seed
```

`make seed` creates an initial set of accounts, pins and boards in PostgreSQL and indexes them into Elasticsearch. Database contents persist across restarts in a Docker named volume, so seeding is only needed once. On every subsequent launch, the backend re-indexes all pins into Elasticsearch automatically.

### Local S3 mock and nginx

The browser uploads pin images directly to AWS S3 with pre-signed URLs. Locally, [Moto](https://docs.getmoto.org/) replaces S3. Moto does not add CORS headers to pre-signed URLs, so the browser blocks the uploads. A thin nginx reverse proxy sits in front of Moto and adds the necessary headers:

```mermaid
sequenceDiagram
    participant Browser
    participant Django API as Django API (:8000)
    participant nginx as nginx (:5555, +CORS hdrs)
    participant Moto as Moto (S3 mock)

    Browser->>Django API: ① request pre-signed URL
    Django API-->>Browser: ② URL pointing to :5555
    Browser->>nginx: ③ PUT image to :5555
    nginx->>Moto: ④ forward
```

No configuration is required — `make launch-backend` starts both Moto and the nginx proxy automatically. Note that Moto has no persistent volume, so uploaded images are lost on restart; the backend re-runs `set_up_moto` at startup to reinitialise the bucket.

### Launching the API

To start the backend stack (Django, PostgreSQL, Elasticsearch, Moto, and the nginx CORS proxy) in detached mode, run:

```bash
> make launch-backend
```

The API will be available at http://localhost:8000/api and the Django admin at http://localhost:8000/admin.

### Launching the web app

To start the web app and the API in detached mode, run:

```bash
> make launch-web
```

The web app will be available at http://localhost:3000.

### Launching the iOS app

To start the backend stack in detached mode and launch the app in the iOS Simulator, run:

```bash
> make launch-ios
```

The Expo process runs in the foreground — keep the terminal open while developing.

## Testing

The app has five test layers:
1. Django unit tests for the backend,
2. Vitest unit tests for the web app,
3. Playwright end-to-end tests for the web app,
4. Jest unit tests for the mobile app,
5. Detox end-to-end tests for the mobile app.

End-to-end (E2E) tests drive the full stack — backend included — through real user flows.

To run the Django unit tests for the backend:

```bash
> make test-backend
```

To run the Vitest unit tests for the web app:

```bash
> make test-web
```

To run the Jest unit tests for the mobile app:

```bash
> make test-mobile
```

To run the Playwright end-to-end tests against the web app:

```bash
> make test-e2e
```

To run the Detox end-to-end tests against the mobile app on the iOS Simulator:

```bash
> make test-e2e-mobile
```

Both E2E suites share one backend stack. `scripts/e2e-backend-up.sh` starts the
services from `docker-compose.e2e.yml`, then migrates and seeds the database.

## Continuous integration

Every pull request targeting `main` runs the
[`Check Pull Request`](.github/workflows/check-pull-request.yml) GitHub Actions workflow.
A `detect-changes` job first computes which parts of the repo changed (via path filters), and
only the affected checks then run. Changing the workflow file itself triggers every job.

| Job | Runs when | What it does |
|-----|-----------|--------------|
| `backend-checks` | `backend/**` changed | Builds the test Docker image, runs migrations, runs the Django test suite |
| `web-checks` | `web/**` changed | `pnpm` install → lint → build → type-check → Vitest unit tests |
| `mobile-checks` | `mobile/**` changed | `yarn` install → lint → `tsc` → Jest unit tests |

NB: E2E tests for web and mobile are not run in the CI.
