from .base import *

SECRET_KEY = "local-secret-key"

# 32-byte PASETO v4.local key, hex-encoded. Development-only fixed value.
PASETO_SYMMETRIC_KEY = (
    "90ca4bf5e366dc71c64a133694814daf3e8256d3c29172fecc8f746339c7645f"
)

DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": "db",
        "PORT": "5432",
        "NAME": "postgres",
        "USER": "postgres",
        "PASSWORD": "postgres",
    }
}

AWS_STORAGE_BUCKET_NAME = "local-pins"
AWS_S3_CUSTOM_DOMAIN = "localhost:5555/local-pins"
AWS_S3_ENDPOINT_URL = "http://moto:5000"

# Presigned upload URLs are generated using the internal Docker endpoint above,
# but the browser needs the host-accessible address to PUT the image:
AWS_S3_PUBLIC_ENDPOINT_URL = "http://localhost:5555"

# The moto mock server only speaks HTTP, so override the default "https:" here:
AWS_S3_URL_PROTOCOL = "http:"

ELASTICSEARCH_URL = "http://elasticsearch:9200"
