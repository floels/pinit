# Backend

Django REST API serving the PinIt platform.

## Stack

- Python 3.12, Django 5, Django REST Framework
- PostgreSQL 13
- AWS S3 via `django-storages` for asset storage
- `djangorestframework-simplejwt` for JWT authentication
- Elasticsearch 8 for full-text search


## Running locally

To run the API and the database only:

```bash
make up-backend   # from the repo root
make up           # from this directory (`backend/`)
```

The API will then be served at `http://localhost:8000/api`.

To run the web app as well, run `make up` from the repo root.

## Running tests

```bash
make test-backend   # from repo root
make test           # from this directory (`backend/`)
```

## API documentation

The API is documented using [OpenAPI 3.0](pinit_api/static/openapi_doc.yml) and rendered with [Redoc](https://github.com/Redocly/redoc).

Once the backend is running, open `http://localhost:8000/api/doc/` in your browser to view the interactive documentation.

