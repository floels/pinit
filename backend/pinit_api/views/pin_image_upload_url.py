import uuid
import boto3
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from pinit_api.lib.constants import ERROR_CODE_INVALID_PIN_IMAGE_FILE_EXTENSION

ALLOWED_EXTENSIONS = {".jpg": "image/jpeg", ".png": "image/png"}
PRESIGNED_URL_EXPIRATION_SECONDS = 3600


class GetPinImageUploadUrlView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        file_extension = request.query_params.get("file_extension", "")

        if file_extension not in ALLOWED_EXTENSIONS:
            return Response(
                {"errors": [{"code": ERROR_CODE_INVALID_PIN_IMAGE_FILE_EXTENSION}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content_type = ALLOWED_EXTENSIONS[file_extension]
        image_file_key = f"pins/pin_image_{uuid.uuid4().hex}{file_extension}"

        s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_S3_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_S3_SECRET_ACCESS_KEY,
            region_name=getattr(settings, "AWS_S3_REGION_NAME", None),
            endpoint_url=getattr(settings, "AWS_S3_ENDPOINT_URL", None),
        )

        upload_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                "Key": image_file_key,
                "ContentType": content_type,
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION_SECONDS,
        )

        private_endpoint = getattr(settings, "AWS_S3_ENDPOINT_URL", None)
        public_endpoint = getattr(settings, "AWS_S3_PUBLIC_ENDPOINT_URL", None)
        if private_endpoint and public_endpoint:
            upload_url = upload_url.replace(private_endpoint, public_endpoint)

        return Response(
            {"upload_url": upload_url, "image_file_key": image_file_key},
            status=status.HTTP_200_OK,
        )
