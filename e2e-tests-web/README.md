# E2E tests

Playwright end-to-end tests for the PinIt web frontend and API.

## Stack

- Playwright 1.35, TypeScript

## Structure

```
e2e-tests-web/
├── global.setup.ts     # Calls ../scripts/e2e-backend-up.sh
├── fixtures/           # Playwright fixture extensions
├── flows/              # Multi-step test flows (authentication, signup, …)
└── routes/             # Tests grouped by route
```

The Docker stack and the seed data live one level up, because the Detox suite in
[`../mobile/e2e`](../mobile/e2e) uses them too:

```
docker-compose.e2e.yml         # backend, Postgres, Elasticsearch, Moto, nginx
scripts/e2e-backend-up.sh      # starts the stack, migrates, seeds
```

## Running

From the repo root:

```bash
make test-e2e
```

From this directory:

```bash
pnpm test
```

## How it works

`global.setup.ts` runs automatically before any test. It calls
`../scripts/e2e-backend-up.sh`, which:

1. Starts the backend, database, Elasticsearch, and S3 mock (Moto) via `docker-compose.e2e.yml` at the repo root
2. Waits for the backend to become reachable
3. Runs Django migrations, `set_up_moto`, and `index_all_pins`
4. Seeds the database with test data via `manage.py seed_database_e2e`

The script fails early with a clear message when port 8000 is already in use.

The Playwright config (`playwright.config.ts`) also starts the frontend dev server automatically if one is not already running on port `3000`.

Docker must be running on the host before invoking any of the commands above.
