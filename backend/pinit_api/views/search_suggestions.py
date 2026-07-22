import logging

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from ..elasticsearch_client import get_es_client, PINS_INDEX

logger = logging.getLogger(__name__)

NUMBER_SUGGESTIONS_RETURNED = 12
ERROR_CODE_MISSING_SEARCH_PARAMETER = "missing_search_parameter"


@api_view(["GET"])
def get_search_suggestions(request):
    search_term = request.GET.get("search", None)

    if not search_term:
        return Response(
            {"errors": [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Keep only alphanumerics: this both normalizes the term and neutralizes any
    # Lucene regexp metacharacters before it is interpolated into the `include`
    # pattern below.
    sanitized_search_term = "".join(char for char in search_term if char.isalnum())
    lowercase_search_term = sanitized_search_term.lower()

    # Aggregate the word tokens of all pins' title + description and return the
    # most frequent ones matching `{prefix}*`, ranked by frequency then
    # alphabetically. This mirrors the previous SQL `GROUP BY word ORDER BY
    # COUNT(*) DESC, word` behaviour, now served from the same Elasticsearch
    # index as the main pin search.
    try:
        es_response = get_es_client().search(
            index=PINS_INDEX,
            size=0,
            aggs={
                "suggestions": {
                    "terms": {
                        "field": "suggest_text",
                        "include": f"{lowercase_search_term}.*",
                        "size": NUMBER_SUGGESTIONS_RETURNED,
                        "order": [{"_count": "desc"}, {"_key": "asc"}],
                    }
                }
            },
        )
    except Exception:
        logger.exception(
            "Elasticsearch suggestions failed for term %r", lowercase_search_term
        )
        return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

    buckets = es_response["aggregations"]["suggestions"]["buckets"]
    suggestions = [bucket["key"] for bucket in buckets]

    return Response({"results": suggestions})
