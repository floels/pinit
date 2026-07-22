import logging
from django.conf import settings
from elasticsearch import Elasticsearch

logger = logging.getLogger(__name__)

PINS_INDEX = "pins"

_client = None


def get_es_client():
    global _client
    if _client is None:
        _client = Elasticsearch(settings.ELASTICSEARCH_URL)
    return _client


def build_pin_document(pin):
    return {
        "unique_id": pin.unique_id,
        "title": pin.title,
        "image_url": pin.image_url,
        "description": pin.description,
        # Combined title + description, used by the search-suggestions endpoint to
        # derive word-level autocomplete suggestions via a terms aggregation.
        "suggest_text": f"{pin.title} {pin.description}",
        "created_at": pin.created_at.isoformat() if pin.created_at else None,
        "author": {
            "username": pin.author.username,
            "display_name": pin.author.display_name,
            "initial": pin.author.initial,
            "profile_picture_url": pin.author.profile_picture_url,
        },
    }


def index_pin(pin):
    try:
        get_es_client().index(
            index=PINS_INDEX,
            id=pin.unique_id,
            document=build_pin_document(pin),
        )
    except Exception:
        logger.exception("Failed to index pin %s in Elasticsearch", pin.unique_id)


def delete_pin(unique_id):
    try:
        get_es_client().delete(index=PINS_INDEX, id=unique_id)
    except Exception:
        logger.exception("Failed to delete pin %s from Elasticsearch", unique_id)
