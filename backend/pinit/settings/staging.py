from .base import *
from decouple import config

SECRET_KEY = config("DJANGO_SECRET_KEY")

DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": "pinit-staging.c3eo8qy8w69x.eu-north-1.rds.amazonaws.com",
        "NAME": "pinit_staging",
        "PORT": "5432",
        "USER": config("POSTGRES_USER"),
        "PASSWORD": config("POSTGRES_PASSWORD"),
    }
}

S3_PINS_BUCKET_NAME = "pinit-staging"
S3_PINS_BUCKET_URL = "pinit-staging.s3.eu-west-3.amazonaws.com"
