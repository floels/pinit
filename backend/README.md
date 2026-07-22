# Backend

Django REST API serving the PinIt platform. See the [root README](../README.md) for the full stack, local setup instructions, and how to run tests.

## Running locally

The root README covers the standard launch commands (`make launch-backend`, etc.). If you're already in this directory, you can also run the backend stack directly:

```bash
make up
```

The API will be available at http://localhost:8000/api.

## Running tests

To run the Django test suite from this directory:

```bash
make test
```

## API documentation

The API is documented using [OpenAPI 3.0](pinit_api/static/openapi_doc.yml) and rendered with [Redoc](https://github.com/Redocly/redoc). Once the backend is running, open http://localhost:8000/api/doc/ in your browser to view the interactive documentation.
