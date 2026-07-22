from .base import *
from decouple import config

SECRET_KEY = config("DJANGO_SECRET_KEY")

# 32-byte PASETO v4.local key, hex-encoded (see base.py for how to generate one).
PASETO_SYMMETRIC_KEY = config("PASETO_SYMMETRIC_KEY")

DEBUG = False

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

ALLOWED_HOSTS = ["*"]

CSRF_TRUSTED_ORIGINS = ["https://d2htb842s00xmw.cloudfront.net"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": config("POSTGRES_HOST"),
        "NAME": config("POSTGRES_DB", default="pinit_staging"),
        "PORT": "5432",
        "USER": config("POSTGRES_USER"),
        "PASSWORD": config("POSTGRES_PASSWORD"),
    }
}

AWS_STORAGE_BUCKET_NAME = config("S3_PINS_BUCKET_NAME", default="pinit-staging-pins")
AWS_S3_REGION_NAME = config("S3_PINS_BUCKET_REGION", default="eu-west-3")
AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com"
