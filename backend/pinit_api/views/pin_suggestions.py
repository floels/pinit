from rest_framework.permissions import IsAuthenticated
from rest_framework import generics

from ..models import Pin
from ..serializers import PinWithAuthorDetailsReadSerializer


class GetPinSuggestionsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Pin.objects.all().order_by("-created_at")
    serializer_class = PinWithAuthorDetailsReadSerializer
