from unittest.mock import patch

from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from pinit_api.views.search_suggestions import (
    ERROR_CODE_MISSING_SEARCH_PARAMETER,
    NUMBER_SUGGESTIONS_RETURNED,
)


def make_agg_response(words):
    """Build an ES response with one suggestions bucket per word (order preserved)."""
    return {
        "aggregations": {
            "suggestions": {
                "buckets": [{"key": word, "doc_count": 1} for word in words]
            }
        }
    }


class SearchSuggestionsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def get(self, search=""):
        return self.client.get("/api/search/suggestions/", {"search": search})

    @patch("pinit_api.views.search_suggestions.get_es_client")
    def test_get_search_suggestions_happy_path(self, mock_get_client):
        # ES returns buckets already ordered by frequency then alphabetically.
        expected = ["beach", "beacha", "beacheresque", "beachiful", "beacho", "beachy"]
        mock_get_client.return_value.search.return_value = make_agg_response(expected)

        response = self.get(search="beach")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(response.json()["results"], expected)

    @patch("pinit_api.views.search_suggestions.get_es_client")
    def test_get_search_suggestions_es_query_structure(self, mock_get_client):
        mock_get_client.return_value.search.return_value = make_agg_response([])

        self.get(search="Beach")

        call_kwargs = mock_get_client.return_value.search.call_args.kwargs
        self.assertEqual(call_kwargs["size"], 0)
        terms = call_kwargs["aggs"]["suggestions"]["terms"]
        self.assertEqual(terms["field"], "suggest_text")
        self.assertEqual(terms["include"], "beach.*")
        self.assertEqual(terms["size"], NUMBER_SUGGESTIONS_RETURNED)
        self.assertEqual(terms["order"], [{"_count": "desc"}, {"_key": "asc"}])

    @patch("pinit_api.views.search_suggestions.get_es_client")
    def test_get_search_suggestions_sanitizes_search_term(self, mock_get_client):
        # Non-alphanumeric characters (incl. Lucene regexp metacharacters) are stripped.
        mock_get_client.return_value.search.return_value = make_agg_response([])

        self.get(search="be.*ch!")

        terms = mock_get_client.return_value.search.call_args.kwargs["aggs"][
            "suggestions"
        ]["terms"]
        self.assertEqual(terms["include"], "bech.*")

    def test_get_search_suggestions_missing_search_param(self):
        response = self.get(search="")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}],
        )

    @patch("pinit_api.views.search_suggestions.get_es_client")
    def test_get_search_suggestions_es_unavailable_returns_503(self, mock_get_client):
        mock_get_client.return_value.search.side_effect = Exception("ES is down")

        response = self.get(search="beach")

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
