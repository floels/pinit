from .base import *

SECRET_KEY = "e2e-test-secret-key"

# 32-byte PASETO v4.local key, hex-encoded. Test-only fixed value.
PASETO_SYMMETRIC_KEY = (
    "e2e00000000000000000000000000000000000000000000000000000000e2e00"
)

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

AWS_STORAGE_BUCKET_NAME = "e2e-test-pins"
AWS_S3_CUSTOM_DOMAIN = "localhost:5555/e2e-test-pins"
AWS_S3_ENDPOINT_URL = "http://moto:5000"

# Presigned upload URLs are generated using the internal Docker endpoint above,
# but the browser needs the host-accessible address to PUT the image:
AWS_S3_PUBLIC_ENDPOINT_URL = "http://localhost:5555"

# The moto mock server only speaks HTTP, so override the default "https:" here:
AWS_S3_URL_PROTOCOL = "http:"

ELASTICSEARCH_URL = "http://elasticsearch_e2e:9200"
