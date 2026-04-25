import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = "Creates the E2E S3 bucket in the moto mock server."

    def handle(self, *args, **options):
        endpoint_url = getattr(settings, "S3_ENDPOINT_URL", None)
        if not endpoint_url:
            self.stdout.write(self.style.WARNING("S3_ENDPOINT_URL not configured — skipping moto setup."))
            return

        s3 = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.S3_PINS_BUCKET_UPLOADER_ACCESS_KEY_ID,
            aws_secret_access_key=settings.S3_PINS_BUCKET_UPLOADER_SECRET_ACCESS_KEY,
            region_name="us-east-1",
        )

        bucket = settings.S3_PINS_BUCKET_NAME

        try:
            s3.create_bucket(Bucket=bucket)
            self.stdout.write(self.style.SUCCESS(f"Created S3 bucket '{bucket}'."))
        except ClientError as exc:
            if exc.response["Error"]["Code"] in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
                self.stdout.write(self.style.WARNING(f"Bucket '{bucket}' already exists — skipping."))
            else:
                raise
