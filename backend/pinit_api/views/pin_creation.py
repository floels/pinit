import re
from django.core.files.storage import default_storage
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from pinit_api.models import Pin
from pinit_api.lib.constants import (
    ERROR_CODE_MISSING_PIN_IMAGE_FILE,
    ERROR_CODE_INVALID_PIN_IMAGE_FILE_KEY,
)
from pinit_api.serializers.pin_serializers import PinBaseReadSerializer

VALID_IMAGE_FILE_KEY_PATTERN = re.compile(
    r"^pins/pin_image_[0-9a-f]{32}\.(jpg|png)$"
)


class CreatePinView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        account = request.user.account
        title = request.data.get("title")
        description = request.data.get("description")
        image_file_key = request.data.get("image_file_key")

        if not image_file_key:
            return Response(
                {"errors": [{"code": ERROR_CODE_MISSING_PIN_IMAGE_FILE}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not VALID_IMAGE_FILE_KEY_PATTERN.match(image_file_key):
            return Response(
                {"errors": [{"code": ERROR_CODE_INVALID_PIN_IMAGE_FILE_KEY}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        image_url = default_storage.url(image_file_key)

        pin = Pin.objects.create(
            title=title,
            description=description,
            author=account,
            image_url=image_url,
        )

        pin_serializer = PinBaseReadSerializer(pin)

        return Response(pin_serializer.data, status=status.HTTP_201_CREATED)
