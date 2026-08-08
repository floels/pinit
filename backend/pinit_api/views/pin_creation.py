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

# The largest dimension a JPEG can declare. It also bounds what a client can
# store, so a wrong value cannot grow without limit.
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
    """Reads the image dimensions of the request.

    The dimensions are optional, because a client that does not know them still
    creates a pin. Returns a (width, height) pair and a validity flag. Both
    values must be present together, so a pin never carries one dimension only.
    """
    raw_width = data.get("image_width")
    raw_height = data.get("image_height")

    if raw_width is None and raw_height is None:
        return (None, None), True

    width = parse_dimension(raw_width)
    height = parse_dimension(raw_height)

    if width is None or height is None:
        return (None, None), False

    return (width, height), True


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

        dimensions, dimensions_are_valid = parse_image_dimensions(request.data)

        if not dimensions_are_valid:
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
