import logging

from pinit_api.adapters.elasticsearch import PINS_INDEX, get_es_client

from .query import SearchUnavailableError

logger = logging.getLogger(__name__)

DEFAULT_SUGGESTION_LIMIT = 12


def suggest_pins(search_term, *, limit=DEFAULT_SUGGESTION_LIMIT):
    """Return autocomplete suggestion strings matching ``search_term``.

    Keeps only alphanumerics so Lucene regexp metacharacters cannot slip into
    the terms ``include`` pattern. Raises ``SearchUnavailableError`` when
    Elasticsearch fails.
    """
    sanitized = "".join(char for char in search_term if char.isalnum()).lower()

    try:
        es_response = get_es_client().search(
            index=PINS_INDEX,
            size=0,
            aggs={
                "suggestions": {
                    "terms": {
                        "field": "suggest_text",
                        "include": f"{sanitized}.*",
                        "size": limit,
                        "order": [{"_count": "desc"}, {"_key": "asc"}],
                    }
                }
            },
        )
    except Exception:
        logger.exception("Elasticsearch suggestions failed for term %r", sanitized)
        raise SearchUnavailableError from None

    buckets = es_response["aggregations"]["suggestions"]["buckets"]
    return [bucket["key"] for bucket in buckets]
