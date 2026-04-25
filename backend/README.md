# Backend

Django REST API serving the Pinit platform.

## Stack

- Python 3.12, Django 5, Django REST Framework
- PostgreSQL 13
- AWS S3 via django-storages (pin images)
- djangorestframework-simplejwt (JWT authentication)

## Structure

```
backend/
├── pinit/                # Django project config
│   ├── settings/
│   │   ├── base.py       # Shared settings
│   │   ├── local.py      # Local development
│   │   ├── e2e.py        # E2E tests (separate DB, Moto for S3)
│   │   └── staging.py    # AWS staging (Elastic Beanstalk + RDS + S3)
│   └── urls.py           # Root URL configuration
└── pinit_api/            # Main application
    ├── models.py
    ├── views/            # One file per resource (accounts, pins, boards, auth…)
    ├── serializers/
    ├── tests/
    └── migrations/
```

## Running locally

From the repo root:

```bash
make up
```

The API is available at http://localhost:8000/api.

## Running tests

```bash
make test-backend
```

This spins up a dedicated Docker test environment, runs migrations, executes the test suite, and tears down the containers.

## S3 credentials

Pin image uploads require AWS credentials. Set `S3_PINS_BUCKET_UPLOADER_ACCESS_KEY_ID` and `S3_PINS_BUCKET_UPLOADER_SECRET_ACCESS_KEY` in a `.env` file at the repo root before running `make up`. Without them the app starts fine — only uploads fail.
