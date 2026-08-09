from unittest.mock import MagicMock, patch

from django.conf import settings
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from pinit_api.views.search import ERROR_CODE_MISSING_SEARCH_PARAMETER

PAGINATION_PAGE_SIZE = settings.REST_FRAMEWORK["PAGE_SIZE"]

SAMPLE_AUTHOR = {
    "username": "testuser",
    "display_name": "Test User",
    "initial": "T",
    "profile_picture_url": "https://example.com/avatar.jpg",
}


def make_hit(title, created_at="2024-01-01T00:00:00", unique_id=None):
    return {
        "_source": {
            "unique_id": unique_id or "100000000000000001",
            "title": title,
            "image_url": "https://example.com/image.jpg",
            "image_width": 1024,
            "image_height": 768,
            "description": "Some description.",
            "created_at": created_at,
            "author": SAMPLE_AUTHOR,
        }
    }


def make_es_response(total, hits):
    return {"hits": {"total": {"value": total, "relation": "eq"}, "hits": hits}}


class SearchPinsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def get(self, q="sunset", page=1):
        return self.client.get("/api/search/", {"q": q, "page": page})

    @patch("pinit_api.views.search.get_es_client")
    def test_happy_path_first_page(self, mock_get_client):
        # Simulate ES returning exactly PAGE_SIZE hits: first 40 title matches, then 10 description matches
        title_hits = [make_hit("Beautiful sunset", unique_id=str(i)) for i in range(PAGINATION_PAGE_SIZE - 10)]
        desc_hits = [make_hit("Some title", unique_id=str(i + PAGINATION_PAGE_SIZE)) for i in range(10)]
        mock_get_client.return_value.search.return_value = make_es_response(
            total=150, hits=title_hits + desc_hits
        )

        response = self.get(page=1)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["count"], 150)
        self.assertEqual(len(data["results"]), PAGINATION_PAGE_SIZE)
        self.assertEqual(data["results"][0]["title"], "Beautiful sunset")
        self.assertEqual(data["results"][-1]["title"], "Some title")

        self._assert_result_shape(data["results"][0])
        self.assertEqual(data["results"][0]["image_width"], 1024)
        self.assertEqual(data["results"][0]["image_height"], 768)

    @patch("pinit_api.views.search.get_es_client")
    def test_happy_path_second_page_sends_correct_offset(self, mock_get_client):
        mock_get_client.return_value.search.return_value = make_es_response(
            total=150, hits=[make_hit("Some title", unique_id=str(i)) for i in range(50)]
        )

        self.get(page=2)

        call_kwargs = mock_get_client.return_value.search.call_args.kwargs
        self.assertEqual(call_kwargs["from_"], PAGINATION_PAGE_SIZE)
        self.assertEqual(call_kwargs["size"], PAGINATION_PAGE_SIZE)

    @patch("pinit_api.views.search.get_es_client")
    def test_happy_path_pagination_links(self, mock_get_client):
        mock_get_client.return_value.search.return_value = make_es_response(
            total=150, hits=[make_hit("Pin", unique_id=str(i)) for i in range(50)]
        )

        response = self.get(page=2)
        data = response.json()

        self.assertIn("page=3", data["next"])
        self.assertIn("page=1", data["previous"])

    @patch("pinit_api.views.search.get_es_client")
    def test_happy_path_es_query_structure(self, mock_get_client):
        mock_get_client.return_value.search.return_value = make_es_response(
            total=1, hits=[make_hit("Beautiful sunset")]
        )

        self.get(q="sunset")

        call_kwargs = mock_get_client.return_value.search.call_args.kwargs
        multi_match = call_kwargs["query"]["multi_match"]
        self.assertEqual(multi_match["query"], "sunset")
        self.assertIn("title^2", multi_match["fields"])
        self.assertIn("description", multi_match["fields"])

    @patch("pinit_api.views.search.get_es_client")
    def test_no_results(self, mock_get_client):
        mock_get_client.return_value.search.return_value = make_es_response(
            total=0, hits=[]
        )

        response = self.get(q="horse")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["count"], 0)
        self.assertListEqual(data["results"], [])
        self.assertIsNone(data["next"])
        self.assertIsNone(data["previous"])

    def test_missing_search_param(self):
        response = self.get(q="")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertEqual(
            data["errors"], [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}]
        )

    @patch("pinit_api.views.search.get_es_client")
    def test_es_unavailable_returns_503(self, mock_get_client):
        mock_get_client.return_value.search.side_effect = Exception("ES is down")

        response = self.get()

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    def _assert_result_shape(self, result):
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
        author = result["author"]
        self.assertEqual(
            set(author.keys()), {"username", "display_name", "initial", "profile_picture_url"}
        )
