import json
import os

from django.conf import settings
from django.test import SimpleTestCase

FIXTURE_PATH = os.path.join(
    settings.BASE_DIR, "..", "pinit_api", "fixtures", "pin_image_urls.json"
)


class PinImageURLsFixtureTests(SimpleTestCase):
    """Guards the contract that 'seed_database_local' relies on.

    Each entry reports the real pixel dimensions of its image to the clients. An
    entry without them makes every seeded pin fall back to measuring its image,
    which hides the normal path during local development.
    """

    def setUp(self):
        with open(FIXTURE_PATH) as fixture_file:
            self.entries = json.load(fixture_file)

    def test_the_fixture_is_not_empty(self):
        self.assertGreater(len(self.entries), 0)

    def test_every_entry_declares_a_url_and_its_dimensions(self):
        for entry in self.entries:
            with self.subTest(entry=entry):
                self.assertIsInstance(entry["url"], str)
                self.assertTrue(entry["url"].startswith("https://"))

                self.assertIsInstance(entry["width"], int)
                self.assertIsInstance(entry["height"], int)

                self.assertGreater(entry["width"], 0)
                self.assertGreater(entry["height"], 0)
