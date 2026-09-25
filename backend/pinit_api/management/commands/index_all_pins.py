from django.core.management import BaseCommand

from pinit_api.domain.search import index_pin, recreate_pins_index
from pinit_api.models import Pin


class Command(BaseCommand):
    help = "Recreates the Elasticsearch pins index and indexes all pins from the database."

    def handle(self, *args, **options):
        self.stdout.write("Resetting Elasticsearch pins index...")
        recreate_pins_index()

        pins = Pin.objects.select_related("author").all()
        total = pins.count()
        self.stdout.write(f"Indexing {total} pins...")

        for pin in pins:
            index_pin(pin)

        self.stdout.write(self.style.SUCCESS(f"Indexed {total} pins successfully."))
