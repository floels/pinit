import logging
import math

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..elasticsearch_client import get_es_client, PINS_INDEX

logger = logging.getLogger(__name__)

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

    shortened_search_term = search_term[:140]

    try:
        page = max(1, int(request.GET.get("page", 1)))
    except ValueError:
        page = 1

    from_offset = (page - 1) * PAGE_SIZE

    try:
        es_response = get_es_client().search(
            index=PINS_INDEX,
            query={
                "multi_match": {
                    "query": shortened_search_term,
                    "fields": ["title^2", "description"],
                    "type": "best_fields",
                }
            },
            sort=[
                {"_score": {"order": "desc"}},
                {"created_at": {"order": "desc"}},
            ],
            from_=from_offset,
            size=PAGE_SIZE,
        )
    except Exception:
        logger.exception("Elasticsearch search failed for query %r", shortened_search_term)
        return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

    total_count = es_response["hits"]["total"]["value"]
    hits = es_response["hits"]["hits"]

    results = []
    for hit in hits:
        source = hit["_source"]
        results.append(
            {
                "unique_id": source["unique_id"],
                "title": source["title"],
                "image_url": source["image_url"],
                # Read with 'get', because documents indexed before the
                # dimensions existed carry neither key until a reindex runs.
                "image_width": source.get("image_width"),
                "image_height": source.get("image_height"),
                "author": source["author"],
            }
        )

    total_pages = math.ceil(total_count / PAGE_SIZE) if total_count > 0 else 1
    base_url = request.build_absolute_uri("/api/search/")
    next_url = (
        f"{base_url}?q={shortened_search_term}&page={page + 1}"
        if page < total_pages
        else None
    )
    previous_url = (
        f"{base_url}?q={shortened_search_term}&page={page - 1}" if page > 1 else None
    )

    return Response(
        {
            "count": total_count,
            "next": next_url,
            "previous": previous_url,
            "results": results,
        }
    )
