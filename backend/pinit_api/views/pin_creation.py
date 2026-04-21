import os
import boto3
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status, serializers
from pinit_api.models import Pin, Account
from pinit_api.lib.constants import (
    ERROR_CODE_PIN_CREATION_FAILED,
    ERROR_CODE_MISSING_PIN_IMAGE_FILE,
)
from pinit_api.serializers.pin_serializers import PinBaseReadSerializer


class CreatePinRequestSerializer(serializers.Serializer):
    title = serializers.CharField(required=False)
    description = serializers.CharField(required=False)
    image_file = serializers.FileField()


class CreatePinView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        account = request.user.account
        title = request.data.get("title")
        description = request.data.get("description")
        uploaded_file = request.FILES.get("image_file")

        if not uploaded_file:
            response_data = {"errors": [{"code": ERROR_CODE_MISSING_PIN_IMAGE_FILE}]}
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        pin = Pin.objects.create(title=title, description=description, author=account)

        _, uploaded_file_extension = os.path.splitext(uploaded_file.name)

        file_key_s3 = self.compute_file_key_s3(pin.unique_id, uploaded_file_extension)

        try:
            self.upload_file_to_s3(uploaded_file, file_key_s3)
        except:
            pin.delete()
            response_data = {"errors": [{"code": ERROR_CODE_PIN_CREATION_FAILED}]}
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        pin.image_url = self.compute_file_url_s3(file_key_s3)
        pin.save()

        pin_serializer = PinBaseReadSerializer(pin)

        return Response(pin_serializer.data, status=status.HTTP_201_CREATED)

    def compute_file_key_s3(self, pin_id, extension):
        return f"pins/pin_{pin_id}{extension}"

    def upload_file_to_s3(self, file, file_name):
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.S3_PINS_BUCKET_UPLOADER_ACCESS_KEY_ID,
            aws_secret_access_key=settings.S3_PINS_BUCKET_UPLOADER_SECRET_ACCESS_KEY,
        )

        s3_client.upload_fileobj(file, settings.S3_PINS_BUCKET_NAME, file_name)

    def compute_file_url_s3(self, file_key_s3):
        return f"https://{settings.S3_PINS_BUCKET_URL}/{file_key_s3}"
