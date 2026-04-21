from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

# We define this custom "token refresh serializer" based on this one:
# https://github.com/jazzband/djangorestframework-simplejwt/blob/master/rest_framework_simplejwt/serializers.py#L102C1-L128C20
# so that the refresh token view also returns the refreshed access
# token's expiration date, which the "djangorestframework-simplejwt"
# library doesn't do natively.


class CustomTokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField(read_only=True)
    token_class = RefreshToken

    def validate(self, attrs):
        refresh_token = self.token_class(attrs["refresh"])

        access_token = refresh_token.access_token

        data = {
            "access_token": str(access_token),
            "access_token_exp": access_token["exp"],
        }

        return data
