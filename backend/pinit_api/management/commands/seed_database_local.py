import os
import json
import random
from django.conf import settings
from pinit_api.tests.testing_utils import AccountFactory, PinFactory, BoardFactory
from django.core.management import BaseCommand
from pinit_api.models import User, Account, Pin, Board

NUMBER_ACCOUNTS_TO_CREATE = 100
NUMBER_PINS_TO_CREATE = 1000
NUMBER_BOARDS_TO_CREATE = 100


class Command(BaseCommand):
    help = "Seeds the database with test data."

    def handle(self, *args, **options):
        self.write_warning("Seeding database...")
        self.seed_database()
        self.write_success("Successfully seeded database!")

    def seed_database(self):
        self.write_warning("Deleting existing users...")
        self.delete_existing_users()
        self.print_number_remaining_items()

        self.write_warning("Creating accounts...")
        number_created_accounts = self.create_accounts()
        self.write_success(f"Created {number_created_accounts} accounts.")

        self.write_warning("Setting account profile pictures...")
        number_profile_pictures_set = self.set_profile_pictures()
        self.write_success(f"Set {number_profile_pictures_set} profile pictures.")

        self.write_warning("Setting account background pictures...")
        number_background_pictures_set = self.set_background_pictures()
        self.write_success(f"Set {number_background_pictures_set} background pictures.")

        self.write_warning("Creating pins...")
        number_created_pins = self.create_pins()
        self.write_success(f"Created {number_created_pins} pins.")

        self.write_warning("Creating boards...")
        number_created_boards = self.create_boards()
        self.write_success(f"Created {number_created_boards} boards.")

        self.write_warning("Saving pins in boards...")
        self.save_pins_in_boards()
        self.write_success("Saved pins in boards.")

    def write_warning(self, message):
        self.stdout.write(self.style.WARNING(message))

    def write_success(self, message):
        self.stdout.write(self.style.SUCCESS(message))

    def delete_existing_users(self):
        User.objects.filter(is_admin=False).delete()

    def print_number_remaining_items(self):
        self.print_number_instances(User)
        self.print_number_instances(Account)
        self.print_number_instances(Pin)
        self.print_number_instances(Board)

    def print_number_instances(self, model=None):
        self.stdout.write(
            f"Number of {model} instances remaining: {model.objects.count()}"
        )

    def create_accounts(self):
        number_created_accounts = 0
        while number_created_accounts < NUMBER_ACCOUNTS_TO_CREATE:
            try:
                AccountFactory.create(profile_picture_url=None)
                number_created_accounts += 1
            except Exception:
                pass

        return number_created_accounts

    def set_profile_pictures(self):
        file_path = os.path.join(
            settings.BASE_DIR,
            "..",
            "pinit_api",
            "fixtures",
            "profile_picture_urls.json",
        )

        with open(file_path) as f:
            picture_urls = json.load(f)

        accounts_to_update = []
        for account in Account.objects.all():
            if self.should_be_updated(account=account, update_limit=80_000_000):
                # statistically, 80% of the 'user_XXX' accounts
                account.profile_picture_url = random.choice(picture_urls)
                accounts_to_update.append(account)

        Account.objects.bulk_update(accounts_to_update, ["profile_picture_url"])

        return len(accounts_to_update)

    def set_background_pictures(self):
        file_path = os.path.join(
            settings.BASE_DIR,
            "..",
            "pinit_api",
            "fixtures",
            "background_picture_urls.json",
        )

        with open(file_path) as f:
            picture_urls = json.load(f)

        accounts_to_update = []
        for account in Account.objects.all():
            if self.should_be_updated(account=account, update_limit=50_000_000):
                # statistically, 50% of the 'user_XXX' accounts
                account.background_picture_url = random.choice(picture_urls)
                accounts_to_update.append(account)

        Account.objects.bulk_update(accounts_to_update, ["background_picture_url"])

        return len(accounts_to_update)

    def should_be_updated(self, account=None, update_limit=0):
        if self.is_test_account(account):
            account_number = self.get_test_account_number(account)
            return account_number < update_limit
        return False

    def is_test_account(self, account):
        return account.username.startswith("user_") and account.username[5:].isdigit()

    def get_test_account_number(self, account=None):
        return int(account.username[5:])

    def create_pins(self):
        file_path = os.path.join(
            settings.BASE_DIR, "..", "pinit_api", "fixtures", "pin_image_urls.json"
        )

        accounts = list(Account.objects.all())

        with open(file_path) as f:
            pin_images = json.load(f)

        for _ in range(NUMBER_PINS_TO_CREATE):
            pin_image = random.choice(pin_images)

            PinFactory.create(
                image_url=pin_image["url"],
                image_width=pin_image["width"],
                image_height=pin_image["height"],
                author=random.choice(accounts),
            )

        return NUMBER_PINS_TO_CREATE

    def create_boards(self):
        accounts = list(Account.objects.all())

        for _ in range(NUMBER_BOARDS_TO_CREATE):
            BoardFactory.create(author=random.choice(accounts))

        return NUMBER_BOARDS_TO_CREATE

    def save_pins_in_boards(self):
        all_pins = list(Pin.objects.all())
        all_boards = Board.objects.all()

        for board in all_boards:
            random_pins = random.sample(all_pins, 10)
            board.pins.set(random_pins)
