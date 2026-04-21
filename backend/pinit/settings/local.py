from .base import *
from datetime import timedelta

SECRET_KEY = "local-secret-key"

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

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
}

S3_PINS_BUCKET_NAME = "pinit-staging"
S3_PINS_BUCKET_URL = "pinit-staging.s3.eu-west-3.amazonaws.com"
