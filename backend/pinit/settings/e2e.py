from .base import *

SECRET_KEY = "e2e-test-secret-key"

DEBUG = True

ALLOWED_HOSTS = ["*"]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": "db_e2e",
        "PORT": "5432",
        "NAME": "postgres_e2e",
        "USER": "postgres",
        "PASSWORD": "postgres",
    }
}

S3_PINS_BUCKET_NAME = "e2e-test-pins"
S3_PINS_BUCKET_URL = "localhost:5555/e2e-test-pins"
S3_ENDPOINT_URL = "http://moto:5000"
