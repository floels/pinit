from .base import *

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

AWS_STORAGE_BUCKET_NAME = "pinit-staging"
AWS_S3_CUSTOM_DOMAIN = "pinit-staging.s3.eu-west-3.amazonaws.com"
