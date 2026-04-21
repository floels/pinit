from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.response import Response

from ..models import Account
from ..serializers.account_serializers import (
    AccountWithPublicDetailsReadSerializer,
    AccountWithPrivateDetailsReadSerializer,
)


class GetAccountPublicDetailsView(generics.RetrieveAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountWithPublicDetailsReadSerializer
    lookup_field = "username"


class GetMyAccountDetailsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AccountWithPrivateDetailsReadSerializer

    def get_object(self):
        return self.request.user.account
