# Backend

Django REST API serving the PinIt platform. See the [root README](../README.md) for more context.

## Running locally

The root README covers the standard launch commands (`make launch-backend`, etc.). If you're already in this directory, you can also run the backend stack directly:

```bash
make up
```

The API will be available at http://localhost:8000/api.

## Running tests

To run the Django test suite from this directory, run:

```bash
make test
```

## Docker setup

There are two Dockerfiles:

- **`Dockerfile`** — used for local development and tests. It installs dependencies and copies the source, but does not run `collectstatic`, does not set a default `DJANGO_SETTINGS_MODULE`, and has no `CMD` (the command is provided by the Docker Compose file instead).
- **`Dockerfile.staging`** — used for the staging deployment on AWS. It additionally runs `collectstatic` at build time, exposes port 80, sets `DJANGO_SETTINGS_MODULE=pinit.settings.aws_staging`, and starts the app with Gunicorn.

## API documentation

The API is documented using [OpenAPI 3.0](pinit_api/static/openapi_doc.yml) and rendered with [Redoc](https://github.com/Redocly/redoc). Once the backend is running, open http://localhost:8000/api/doc/ in your browser to view the documentation.
