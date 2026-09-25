"""Elasticsearch transport client.

Domain search owns pin documents, mappings, indexing, and queries. This module
only knows how to reach the cluster and which index name to use.
"""

from django.conf import settings
from elasticsearch import Elasticsearch

PINS_INDEX = "pins"

_client = None


def get_es_client():
    global _client
    if _client is None:
        _client = Elasticsearch(settings.ELASTICSEARCH_URL)
    return _client
