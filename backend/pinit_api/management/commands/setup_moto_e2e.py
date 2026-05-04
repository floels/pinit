import json
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.management import BaseCommand


class Command(BaseCommand):
    help = "Creates the E2E S3 bucket in the moto mock server."

    def handle(self, *args, **options):
        endpoint_url = getattr(settings, "AWS_S3_ENDPOINT_URL", None)
        if not endpoint_url:
            self.stdout.write(self.style.WARNING("AWS_S3_ENDPOINT_URL not configured — skipping moto setup."))
            return

        s3 = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            region_name="us-east-1",
        )

        bucket = settings.AWS_STORAGE_BUCKET_NAME

        try:
            s3.create_bucket(Bucket=bucket)
            self.stdout.write(self.style.SUCCESS(f"Created S3 bucket '{bucket}'."))
        except ClientError as exc:
            if exc.response["Error"]["Code"] in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
                self.stdout.write(self.style.WARNING(f"Bucket '{bucket}' already exists — skipping."))
            else:
                raise

        s3.put_bucket_cors(
            Bucket=bucket,
            CORSConfiguration={
                "CORSRules": [
                    {
                        "AllowedOrigins": ["*"],
                        "AllowedMethods": ["PUT", "GET"],
                        "AllowedHeaders": ["*"],
                    }
                ]
            },
        )
        self.stdout.write(self.style.SUCCESS(f"Configured CORS on bucket '{bucket}'."))

        s3.put_bucket_policy(
            Bucket=bucket,
            Policy=json.dumps({
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{bucket}/*",
                    }
                ],
            }),
        )
        self.stdout.write(self.style.SUCCESS(f"Configured public read policy on bucket '{bucket}'."))
