# E2E tests

Playwright end-to-end tests for the Pinit web frontend.

## Stack

- Playwright 1.35, TypeScript

## Structure

```
e2e-web/
├── global.setup.ts     # Starts Docker services, runs migrations, seeds the DB
├── fixtures/           # Playwright fixture extensions
├── flows/              # Multi-step test flows (authentication, signup, …)
└── routes/             # Tests grouped by route
```

## Running

From the repo root:

```bash
make test-e2e
```

From this directory:

```bash
pnpm test            # headless Chromium
pnpm test:ui         # Playwright UI mode
pnpm test:report     # open the last HTML report
```

## How it works

`global.setup.ts` runs automatically before any test. It:

1. Starts the backend, database, and S3 mock (Moto) via `docker-compose.e2e.yml` at the repo root
2. Waits for the backend to become reachable
3. Runs Django migrations
4. Seeds the database with test data via `manage.py seed_e2e_database`

The Playwright config (`playwright.config.ts`) also starts the frontend dev server automatically if one is not already running on port 3000.

Docker must be running on the host before invoking any of the commands above.
