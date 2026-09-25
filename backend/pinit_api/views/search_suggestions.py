from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from pinit_api.domain.search import SearchUnavailableError, suggest_pins

ERROR_CODE_MISSING_SEARCH_PARAMETER = "missing_search_parameter"


@api_view(["GET"])
def get_search_suggestions(request):
    search_term = request.GET.get("search", None)

    if not search_term:
        return Response(
            {"errors": [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        suggestions = suggest_pins(search_term)
    except SearchUnavailableError:
        return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response({"results": suggestions})
