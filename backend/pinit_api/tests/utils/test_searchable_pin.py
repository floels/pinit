from unittest.mock import MagicMock, patch

from django.conf import settings
from django.test import TestCase

from pinit_api.domain.search import (
    DEFAULT_SUGGESTION_LIMIT,
    SearchUnavailableError,
    search_pins,
    suggest_pins,
)
from pinit_api.domain.search.document import (
    INDEX_MAPPINGS,
    build_pin_document,
    pin_result_from_source,
)
from pinit_api.domain.search.indexing import recreate_pins_index
from ..testing_utils import PinFactory

PAGE_SIZE = settings.REST_FRAMEWORK["PAGE_SIZE"]


class BuildPinDocumentTests(TestCase):
    def test_includes_suggest_text_and_author(self):
        pin = PinFactory(title="Sunset", description="Over the ocean")

        document = build_pin_document(pin)

        self.assertEqual(document["unique_id"], str(pin.unique_id))
        self.assertEqual(document["title"], "Sunset")
        self.assertEqual(document["suggest_text"], "Sunset Over the ocean")
        self.assertEqual(document["author"]["username"], pin.author.username)
        self.assertEqual(document["author"]["display_name"], pin.author.display_name)


class PinResultFromSourceTests(TestCase):
    def test_drops_description_and_suggest_text(self):
        source = {
            "unique_id": "1",
            "title": "Sunset",
            "image_url": "https://example.com/a.jpg",
            "image_width": 10,
            "image_height": 20,
            "description": "hidden",
            "suggest_text": "Sunset hidden",
            "author": {"username": "u"},
        }

        result = pin_result_from_source(source)

        self.assertEqual(
            set(result.keys()),
            {
                "unique_id",
                "title",
                "image_url",
                "image_width",
                "image_height",
                "author",
            },
        )


class SearchPinsDomainTests(TestCase):
    @patch("pinit_api.domain.search.query.get_es_client")
    def test_query_structure_and_offset(self, mock_get_client):
        mock_get_client.return_value.search.return_value = {
            "hits": {"total": {"value": 1}, "hits": []}
        }

        search_pins(query="sunset", page=2, page_size=PAGE_SIZE)

        call_kwargs = mock_get_client.return_value.search.call_args.kwargs
        multi_match = call_kwargs["query"]["multi_match"]
        self.assertEqual(multi_match["query"], "sunset")
        self.assertIn("title^2", multi_match["fields"])
        self.assertIn("description", multi_match["fields"])
        self.assertEqual(call_kwargs["from_"], PAGE_SIZE)
        self.assertEqual(call_kwargs["size"], PAGE_SIZE)

    @patch("pinit_api.domain.search.query.get_es_client")
    def test_truncates_long_query(self, mock_get_client):
        mock_get_client.return_value.search.return_value = {
            "hits": {"total": {"value": 0}, "hits": []}
        }
        long_query = "x" * 200

        search_pins(query=long_query, page=1, page_size=PAGE_SIZE)

        multi_match = mock_get_client.return_value.search.call_args.kwargs["query"][
            "multi_match"
        ]
        self.assertEqual(len(multi_match["query"]), 140)

    @patch("pinit_api.domain.search.query.get_es_client")
    def test_maps_hits_to_results(self, mock_get_client):
        mock_get_client.return_value.search.return_value = {
            "hits": {
                "total": {"value": 1},
                "hits": [
                    {
                        "_source": {
                            "unique_id": "42",
                            "title": "Sunset",
                            "image_url": "https://example.com/a.jpg",
                            "image_width": 10,
                            "image_height": 20,
                            "description": "desc",
                            "author": {"username": "u"},
                        }
                    }
                ],
            }
        }

        outcome = search_pins(query="sunset", page=1, page_size=PAGE_SIZE)

        self.assertEqual(outcome["total_count"], 1)
        self.assertEqual(outcome["results"][0]["unique_id"], "42")
        self.assertNotIn("description", outcome["results"][0])

    @patch("pinit_api.domain.search.query.get_es_client")
    def test_raises_when_elasticsearch_fails(self, mock_get_client):
        mock_get_client.return_value.search.side_effect = Exception("ES is down")

        with self.assertRaises(SearchUnavailableError):
            search_pins(query="sunset", page=1, page_size=PAGE_SIZE)


class SuggestPinsDomainTests(TestCase):
    @patch("pinit_api.domain.search.suggestions.get_es_client")
    def test_query_structure(self, mock_get_client):
        mock_get_client.return_value.search.return_value = {
            "aggregations": {"suggestions": {"buckets": []}}
        }

        suggest_pins("Beach")

        call_kwargs = mock_get_client.return_value.search.call_args.kwargs
        self.assertEqual(call_kwargs["size"], 0)
        terms = call_kwargs["aggs"]["suggestions"]["terms"]
        self.assertEqual(terms["field"], "suggest_text")
        self.assertEqual(terms["include"], "beach.*")
        self.assertEqual(terms["size"], DEFAULT_SUGGESTION_LIMIT)
        self.assertEqual(terms["order"], [{"_count": "desc"}, {"_key": "asc"}])

    @patch("pinit_api.domain.search.suggestions.get_es_client")
    def test_sanitizes_search_term(self, mock_get_client):
        mock_get_client.return_value.search.return_value = {
            "aggregations": {"suggestions": {"buckets": []}}
        }

        suggest_pins("be.*ch!")

        terms = mock_get_client.return_value.search.call_args.kwargs["aggs"][
            "suggestions"
        ]["terms"]
        self.assertEqual(terms["include"], "bech.*")

    @patch("pinit_api.domain.search.suggestions.get_es_client")
    def test_returns_bucket_keys(self, mock_get_client):
        mock_get_client.return_value.search.return_value = {
            "aggregations": {
                "suggestions": {
                    "buckets": [
                        {"key": "beach", "doc_count": 3},
                        {"key": "beachy", "doc_count": 1},
                    ]
                }
            }
        }

        self.assertEqual(suggest_pins("beach"), ["beach", "beachy"])

    @patch("pinit_api.domain.search.suggestions.get_es_client")
    def test_raises_when_elasticsearch_fails(self, mock_get_client):
        mock_get_client.return_value.search.side_effect = Exception("ES is down")

        with self.assertRaises(SearchUnavailableError):
            suggest_pins("beach")


class RecreatePinsIndexTests(TestCase):
    @patch("pinit_api.domain.search.indexing.get_es_client")
    def test_deletes_existing_then_creates_with_mappings(self, mock_get_client):
        es = MagicMock()
        es.indices.exists.return_value = True
        mock_get_client.return_value = es

        recreate_pins_index()

        es.indices.delete.assert_called_once()
        es.indices.create.assert_called_once()
        self.assertEqual(
            es.indices.create.call_args.kwargs["mappings"], INDEX_MAPPINGS
        )
