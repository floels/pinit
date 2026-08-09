import re
from django.core.files.storage import default_storage
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status
from pinit_api.models import Pin
from pinit_api.lib.constants import (
    ERROR_CODE_MISSING_PIN_IMAGE_FILE,
    ERROR_CODE_INVALID_PIN_IMAGE_FILE_KEY,
    ERROR_CODE_INVALID_PIN_IMAGE_DIMENSIONS,
)
from pinit_api.serializers.pin_serializers import PinBaseReadSerializer

VALID_IMAGE_FILE_KEY_PATTERN = re.compile(
    r"^pins/pin_image_[0-9a-f]{32}\.(jpg|png)$"
)

# A sanity ceiling. Nothing enforces the dimensions that a client reports, and a
# bad ratio distorts the pin on every board that shows it. The value is the JPEG
# limit, which no realistic PNG reaches either.
MAX_IMAGE_DIMENSION = 65535


def parse_dimension(raw_value):
    """Returns the dimension as an int, or None if it is not usable."""
    if isinstance(raw_value, bool):
        return None

    try:
        value = int(raw_value)
    except (TypeError, ValueError):
        return None

    if value < 1 or value > MAX_IMAGE_DIMENSION:
        return None

    return value


def parse_image_dimensions(data):
    """Returns a (width, height) pair, or None if the request does not carry one.

    Both dimensions are required. Every client holds the image that it uploads,
    so it knows them. Requiring them here lets every read return them, and lets
    the clients lay out a pin without measuring its image.
    """
    width = parse_dimension(data.get("image_width"))
    height = parse_dimension(data.get("image_height"))

    if width is None or height is None:
        return None

    return width, height


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

        dimensions = parse_image_dimensions(request.data)

        if dimensions is None:
            return Response(
                {"errors": [{"code": ERROR_CODE_INVALID_PIN_IMAGE_DIMENSIONS}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        image_width, image_height = dimensions

        image_url = default_storage.url(image_file_key)

        pin = Pin.objects.create(
            title=title,
            description=description,
            author=account,
            image_url=image_url,
            image_width=image_width,
            image_height=image_height,
        )

        pin_serializer = PinBaseReadSerializer(pin)

        return Response(pin_serializer.data, status=status.HTTP_201_CREATED)
