from rest_framework import serializers

from ..models import Pin
from .account_serializers import AccountBaseReadSerializer


class PinBaseReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pin
        fields = (
            "unique_id",
            "image_url",
            "title",
        )


class PinWithAuthorDetailsReadSerializer(PinBaseReadSerializer):
    author = AccountBaseReadSerializer(read_only=True)

    class Meta(PinBaseReadSerializer.Meta):
        fields = PinBaseReadSerializer.Meta.fields + ("author",)


class PinWithFullDetailsReadSerializer(PinWithAuthorDetailsReadSerializer):
    class Meta(PinWithAuthorDetailsReadSerializer.Meta):
        fields = PinWithAuthorDetailsReadSerializer.Meta.fields + ("description",)
