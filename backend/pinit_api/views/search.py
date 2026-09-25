import math

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from pinit_api.domain.search import (
    MAX_QUERY_LENGTH,
    SearchUnavailableError,
    search_pins as find_pins,
)

ERROR_CODE_MISSING_SEARCH_PARAMETER = "missing_search_parameter"

PAGE_SIZE = settings.REST_FRAMEWORK["PAGE_SIZE"]


@api_view(["GET"])
def search_pins(request):
    search_term = request.GET.get("q", None)

    if not search_term:
        return Response(
            {"errors": [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        page = max(1, int(request.GET.get("page", 1)))
    except ValueError:
        page = 1

    try:
        outcome = find_pins(query=search_term, page=page, page_size=PAGE_SIZE)
    except SearchUnavailableError:
        return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

    total_count = outcome["total_count"]
    total_pages = math.ceil(total_count / PAGE_SIZE) if total_count > 0 else 1
    # Domain truncates the query; pagination links must match the queried term.
    link_query = search_term[:MAX_QUERY_LENGTH]
    base_url = request.build_absolute_uri("/api/search/")
    next_url = (
        f"{base_url}?q={link_query}&page={page + 1}" if page < total_pages else None
    )
    previous_url = (
        f"{base_url}?q={link_query}&page={page - 1}" if page > 1 else None
    )

    return Response(
        {
            "count": total_count,
            "next": next_url,
            "previous": previous_url,
            "results": outcome["results"],
        }
    )
