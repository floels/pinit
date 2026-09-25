import logging

from pinit_api.adapters.elasticsearch import PINS_INDEX, get_es_client

from .document import INDEX_MAPPINGS, build_pin_document

logger = logging.getLogger(__name__)


def index_pin(pin):
    try:
        get_es_client().index(
            index=PINS_INDEX,
            id=str(pin.unique_id),
            document=build_pin_document(pin),
        )
    except Exception:
        logger.exception("Failed to index pin %s in Elasticsearch", pin.unique_id)


def delete_pin(unique_id):
    try:
        get_es_client().delete(index=PINS_INDEX, id=str(unique_id))
    except Exception:
        logger.exception("Failed to delete pin %s from Elasticsearch", unique_id)


def recreate_pins_index():
    """Drop and recreate the pins index with the current mappings."""
    es = get_es_client()
    if es.indices.exists(index=PINS_INDEX):
        es.indices.delete(index=PINS_INDEX)
    es.indices.create(index=PINS_INDEX, mappings=INDEX_MAPPINGS)
