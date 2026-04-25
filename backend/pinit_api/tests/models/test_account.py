from django.test import TestCase

from ..testing_utils import AccountFactory, BusinessAccountFactory


class AccountDisplayNameTests(TestCase):
    def test_display_name_personal_account(self):
        account = AccountFactory(first_name="Jane", last_name="Smith")

        self.assertEqual(account.display_name, "Jane Smith")

    def test_display_name_business_account(self):
        account = BusinessAccountFactory(business_name="Acme Corp")

        self.assertEqual(account.display_name, "Acme Corp")
