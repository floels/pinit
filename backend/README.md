# Backend

Django REST API serving the PinIt platform.

## Stack

- Python 3.12, Django 5, Django REST Framework
- PostgreSQL 13
- AWS S3 via `django-storages` for asset storage
- `djangorestframework-simplejwt` for JWT authentication


## Running locally

To run the API and the database only:

```bash
make up-backend   # from the repo root
make up           # from this directory (`backend/`)
```

The API will then be served at `http://localhost:8000/api`.

To run the frontend as well, run `make up` from the repo root.

## Running tests

```bash
make test-backend   # from repo root
make test           # from this directory (`backend/`)
```

## S3 credentials

Pin image uploads require AWS credentials. Set `S3_PINS_BUCKET_UPLOADER_ACCESS_KEY_ID` and `S3_PINS_BUCKET_UPLOADER_SECRET_ACCESS_KEY` in a `.env` file at the repo root before running `make up`. Without them the app starts fine — only uploads fail.
