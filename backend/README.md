# Backend

Django REST API serving the PinIt platform. See the [root README](../README.md) for more context.

## Running locally

The root README covers the standard launch commands (`make launch-backend`, etc.). If you're already in this directory, you can start the same backend stack (Django, PostgreSQL, Elasticsearch, Moto, and the nginx CORS proxy) with:

```bash
make up
```

This is equivalent to running `make launch-backend` from the root.

The API will be available at http://localhost:8000/api.

## Running tests

To run the Django test suite from this directory, run:

```bash
make test
```

## Dependencies

Python dependencies are managed with [pip-tools](https://github.com/jazzband/pip-tools). Two layers live under `requirements/`:

- **`*.in` files** — hand-edited lists of *direct* dependencies. `base.in` holds runtime deps; `dev.in` layers test-only deps (`factory-boy`, `moto`, ...) on top via `-r base.in`.
- **`*.txt` files** — generated, fully-pinned, hash-locked lockfiles covering the entire transitive closure. **Do not edit these by hand.** `base.txt` is installed in the staging image; `dev.txt` (a superset) is installed in the local/test image.

To add, remove, or bump a dependency, edit the relevant `*.in` file and regenerate the lockfiles:

```bash
make compile-deps
```

This runs `pip-compile` inside a `python:3.12-slim` container so the resolved versions and hashes match the deployment target regardless of your host OS. Commit both the `*.in` and `*.txt` changes together.

## Docker setup

There are two Dockerfiles:

- **`Dockerfile`** — used for local development and tests. It installs dependencies and copies the source, but does not run `collectstatic`, does not set a default `DJANGO_SETTINGS_MODULE`, and has no `CMD` (the command is provided by the Docker Compose file instead).
- **`Dockerfile.staging`** — used for the staging deployment on AWS. It additionally runs `collectstatic` at build time, exposes port 80, sets `DJANGO_SETTINGS_MODULE=pinit.settings.aws_staging`, and starts the app with Gunicorn.

## Documentation

Developer documentation for the backend lives in the [`pinit_api/doc/`](pinit_api/doc) folder.

## API documentation

The API is documented using [OpenAPI 3.0](pinit_api/static/openapi_doc.yml) and rendered with [Redoc](https://github.com/Redocly/redoc). Once the backend is running, open http://localhost:8000/api/doc/ in your browser to view the documentation.
