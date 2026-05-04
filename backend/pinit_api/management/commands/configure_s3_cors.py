import boto3
from django.conf import settings
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = (
        "Sets a CORS policy on the S3 pins bucket so browsers can fetch images "
        "directly (required for the client-side image download feature). "
        "Run this once per environment after creating the bucket."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--allowed-origin",
            default="*",
            help="Frontend origin to allow (e.g. https://example.com). Defaults to '*'.",
        )

    def handle(self, *args, **options):
        allowed_origin = options["allowed_origin"]

        kwargs = {}
        endpoint_url = getattr(settings, "AWS_S3_ENDPOINT_URL", None)
        if endpoint_url:
            kwargs["endpoint_url"] = endpoint_url

        region = getattr(settings, "AWS_S3_REGION_NAME", "us-east-1")

        s3 = boto3.client("s3", region_name=region, **kwargs)

        bucket = settings.AWS_STORAGE_BUCKET_NAME

        s3.put_bucket_cors(
            Bucket=bucket,
            CORSConfiguration={
                "CORSRules": [
                    {
                        "AllowedOrigins": [allowed_origin],
                        "AllowedMethods": ["GET"],
                        "AllowedHeaders": ["*"],
                    }
                ]
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"CORS configured on bucket '{bucket}': GET allowed from '{allowed_origin}'."
            )
        )
