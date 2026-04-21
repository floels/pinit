# Here we put the serializers which need to be imported by several
# types of serializers, so as to avoid circular dependencies.
from rest_framework import serializers
from ..models import Account


class AccountBaseReadSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = (
            "username",
            "display_name",
            "initial",
            "profile_picture_url",
        )

    def get_display_name(self, obj):
        return obj.display_name
