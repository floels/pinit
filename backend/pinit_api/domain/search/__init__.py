"""Searchable Pin: index, query, and suggest.

Views authorize and map HTTP errors; this package owns the pin search document,
mappings, write-path index/delete, pin search, and suggestions. Elasticsearch
stays behind ``adapters.elasticsearch``.
"""

from .indexing import delete_pin, index_pin, recreate_pins_index
from .query import MAX_QUERY_LENGTH, SearchUnavailableError, search_pins
from .suggestions import DEFAULT_SUGGESTION_LIMIT, suggest_pins

__all__ = [
    "DEFAULT_SUGGESTION_LIMIT",
    "MAX_QUERY_LENGTH",
    "SearchUnavailableError",
    "delete_pin",
    "index_pin",
    "recreate_pins_index",
    "search_pins",
    "suggest_pins",
]
