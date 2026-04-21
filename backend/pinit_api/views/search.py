from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

from ..models import Pin
from ..serializers import PinWithAuthorDetailsReadSerializer


ERROR_CODE_MISSING_SEARCH_PARAMETER = "missing_search_parameter"


@api_view(["GET"])
def search_pins(request):
    search_term = request.GET.get("q", None)

    if not search_term:
        return Response(
            {"errors": [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    shortened_search_term = search_term[:140]

    search_vector = SearchVector("title", weight="A") + SearchVector(
        "description", weight="B"
    )
    search_query = SearchQuery(shortened_search_term)

    all_pins_annotated = Pin.objects.annotate(
        search=search_vector, rank=SearchRank(search_vector, search_query)
    )

    matched_pins = all_pins_annotated.filter(search=search_query)

    search_results = matched_pins.order_by("-rank", "-created_at")

    paginator = PageNumberPagination()
    paginated_results = paginator.paginate_queryset(search_results, request)

    serializer = PinWithAuthorDetailsReadSerializer(paginated_results, many=True)

    return paginator.get_paginated_response(serializer.data)
