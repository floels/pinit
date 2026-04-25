# Backend

Django REST API serving the PinIt platform.

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
│   │   └── aws_staging.py  # AWS staging (Elastic Beanstalk + RDS + S3)
│   └── urls.py           # Root URL configuration
└── pinit_api/            # Main application
    ├── models.py
    ├── views/            # One file per resource (accounts, pins, boards, auth…)
    ├── serializers/
    ├── tests/
    └── migrations/
```

## Running locally

Full stack (DB + backend + frontend), from the repo root:

```bash
make up
```

Backend and DB only — from the repo root or from this directory:

```bash
make up-backend   # repo root
make up           # this directory
```

Without Docker (requires a running PostgreSQL instance on port 5432):

```bash
pip install -r requirements.txt
DJANGO_SETTINGS_MODULE=pinit.settings.local python manage.py migrate
DJANGO_SETTINGS_MODULE=pinit.settings.local python manage.py runserver
```

The API is available at http://localhost:8000/api.

## Running tests

From the repo root or from this directory:

```bash
make test-backend   # repo root
make test           # this directory
```

## S3 credentials

Pin image uploads require AWS credentials. Set `S3_PINS_BUCKET_UPLOADER_ACCESS_KEY_ID` and `S3_PINS_BUCKET_UPLOADER_SECRET_ACCESS_KEY` in a `.env` file at the repo root before running `make up`. Without them the app starts fine — only uploads fail.
