import os
from django.core.files.storage import default_storage
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

        _, extension = os.path.splitext(uploaded_file.name)
        file_key = f"pins/pin_{pin.unique_id}{extension}"

        try:
            saved_name = default_storage.save(file_key, uploaded_file)
        except:
            pin.delete()
            response_data = {"errors": [{"code": ERROR_CODE_PIN_CREATION_FAILED}]}
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        pin.image_url = default_storage.url(saved_name)
        pin.save()

        pin_serializer = PinBaseReadSerializer(pin)

        return Response(pin_serializer.data, status=status.HTTP_201_CREATED)

