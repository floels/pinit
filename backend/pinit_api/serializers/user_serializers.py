from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from ..models import User
from ..lib.constants import (
    ERROR_CODE_INVALID_EMAIL,
    ERROR_CODE_INVALID_PASSWORD,
)

ERROR_CODE_INVALID_BIRTHDATE = "invalid_birthdate"
ERROR_CODE_EMAIL_ALREADY_SIGNED_UP = "email_already_signed_up"


class UserCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(), message=ERROR_CODE_EMAIL_ALREADY_SIGNED_UP
            )
        ],
        error_messages={
            "invalid": ERROR_CODE_INVALID_EMAIL,
            "required": ERROR_CODE_INVALID_EMAIL,
            "blank": ERROR_CODE_INVALID_EMAIL,
        },
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        error_messages={
            "invalid": ERROR_CODE_INVALID_PASSWORD,
            "required": ERROR_CODE_INVALID_PASSWORD,
            "blank": ERROR_CODE_INVALID_PASSWORD,
        },
    )
    birthdate = serializers.DateField(
        required=True,
        error_messages={
            "invalid": ERROR_CODE_INVALID_BIRTHDATE,
            "required": ERROR_CODE_INVALID_BIRTHDATE,
            "blank": ERROR_CODE_INVALID_BIRTHDATE,
        },
    )

    class Meta:
        model = User
        fields = ("email", "password", "birthdate")

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError:
            raise serializers.ValidationError(ERROR_CODE_INVALID_PASSWORD)
        return value
