from django.core.management import BaseCommand

from pinit_api.elasticsearch_client import get_es_client, index_pin, PINS_INDEX
from pinit_api.models import Pin

INDEX_MAPPINGS = {
    "properties": {
        "unique_id": {"type": "keyword"},
        "title": {"type": "text", "analyzer": "english"},
        "description": {"type": "text", "analyzer": "english"},
        # Analyzed with the (non-stemming) standard analyzer and made aggregatable
        # via fielddata, so the search-suggestions endpoint can run a terms
        # aggregation over its word tokens to build autocomplete suggestions.
        "suggest_text": {"type": "text", "analyzer": "standard", "fielddata": True},
        "image_url": {"type": "keyword", "index": False},
        "created_at": {"type": "date"},
        "author": {
            "type": "object",
            "properties": {
                "username": {"type": "keyword"},
                "display_name": {"type": "keyword"},
                "initial": {"type": "keyword"},
                "profile_picture_url": {"type": "keyword", "index": False},
            },
        },
    }
}


class Command(BaseCommand):
    help = "Recreates the Elasticsearch pins index and indexes all pins from the database."

    def handle(self, *args, **options):
        es = get_es_client()

        self.stdout.write("Resetting Elasticsearch pins index...")
        if es.indices.exists(index=PINS_INDEX):
            es.indices.delete(index=PINS_INDEX)
        es.indices.create(index=PINS_INDEX, mappings=INDEX_MAPPINGS)

        pins = Pin.objects.select_related("author").all()
        total = pins.count()
        self.stdout.write(f"Indexing {total} pins...")

        for pin in pins:
            index_pin(pin)

        self.stdout.write(self.style.SUCCESS(f"Indexed {total} pins successfully."))
