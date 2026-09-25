import logging

from pinit_api.adapters.elasticsearch import PINS_INDEX, get_es_client

from .document import pin_result_from_source

logger = logging.getLogger(__name__)

MAX_QUERY_LENGTH = 140


class SearchUnavailableError(Exception):
    """Raised when the search index cannot be queried."""


def search_pins(*, query, page, page_size):
    """Search indexed pins for ``query``.

    Truncates ``query`` to ``MAX_QUERY_LENGTH``. Returns
    ``{"total_count": int, "results": [pin dict, ...]}`` using the search-hit
    read shape. Raises ``SearchUnavailableError`` when Elasticsearch fails.
    """
    shortened_query = query[:MAX_QUERY_LENGTH]
    from_offset = (page - 1) * page_size

    try:
        es_response = get_es_client().search(
            index=PINS_INDEX,
            query={
                "multi_match": {
                    "query": shortened_query,
                    "fields": ["title^2", "description"],
                    "type": "best_fields",
                }
            },
            sort=[
                {"_score": {"order": "desc"}},
                {"created_at": {"order": "desc"}},
            ],
            from_=from_offset,
            size=page_size,
        )
    except Exception:
        logger.exception("Elasticsearch search failed for query %r", shortened_query)
        raise SearchUnavailableError from None

    total_count = es_response["hits"]["total"]["value"]
    results = [
        pin_result_from_source(hit["_source"])
        for hit in es_response["hits"]["hits"]
    ]

    return {"total_count": total_count, "results": results}
