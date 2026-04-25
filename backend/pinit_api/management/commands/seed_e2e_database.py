from django.core.management import BaseCommand
from pinit_api.models import User, Account, Pin

E2E_TEST_USER_EMAIL = "e2e_test@example.com"
E2E_TEST_USER_PASSWORD = "testpassword123"
E2E_TEST_USER_USERNAME = "e2etestuser"

JOHNDOE_EMAIL = "john.doe@example.com"
JOHNDOE_USERNAME = "johndoe"

# Fixed unique_id so tests can reference a known pin
TEST_PIN_UNIQUE_ID = "e2etestpin000001"

# Enough pins for the search test to return at least one result
SEARCH_SEED_TERM = "playwrightuniquesearch"
NUMBER_OF_SEARCH_PINS = 3


class Command(BaseCommand):
    help = "Clears the E2E database and seeds it with known test data."

    def handle(self, *args, **options):
        self.stdout.write("Clearing database...")
        User.objects.all().delete()

        self.stdout.write("Creating E2E test user...")
        test_user = User.objects.create_user(
            email=E2E_TEST_USER_EMAIL,
            password=E2E_TEST_USER_PASSWORD,
        )
        Account.objects.create(
            username=E2E_TEST_USER_USERNAME,
            type="personal",
            first_name="E2E",
            last_name="User",
            initial="E",
            owner=test_user,
        )

        self.stdout.write("Creating johndoe user...")
        johndoe_user = User.objects.create_user(email=JOHNDOE_EMAIL, password="johndoepassword123")
        johndoe_account = Account.objects.create(
            username=JOHNDOE_USERNAME,
            type="personal",
            first_name="John",
            last_name="Doe",
            initial="J",
            description="Description for account of John Doe.",
            profile_picture_url="https://example.com/john_doe_avatar.jpg",
            owner=johndoe_user,
        )

        self.stdout.write("Creating test pin with known ID...")
        Pin.objects.create(
            unique_id=TEST_PIN_UNIQUE_ID,
            title="Pin title",
            description="Pin description.",
            image_url="https://example.com/test-pin-image.jpg",
            author=johndoe_account,
        )

        self.stdout.write(f"Creating {NUMBER_OF_SEARCH_PINS} searchable pins...")
        for i in range(1, NUMBER_OF_SEARCH_PINS + 1):
            Pin.objects.create(
                title=f"Sample pin {i} {SEARCH_SEED_TERM}",
                description=f"Description of sample pin {i}.",
                image_url=f"https://example.com/sample-pin-{i}.jpg",
                author=johndoe_account,
            )

        self.stdout.write(self.style.SUCCESS("E2E database seeded successfully."))
