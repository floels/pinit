from django.test import TestCase
from pinit_api.lib.utils.string_operations import *


class TestComputeInitialFromEmail(TestCase):
    def test_compute_initial_with_letter(self):
        email = "john.doe23@example.com"
        computed_initial = compute_initial(email=email)
        self.assertEqual(computed_initial, "J")

    def test_compute_initial_without_letter(self):
        email = "1234@example.com"
        computed_initial = compute_initial(email=email)
        self.assertEqual(computed_initial, "X")


class TestComputeUsernameCandidateFromEmail(TestCase):
    def test_compute_username_candidate_with_alphabetical_characters(self):
        email = "john.doe23@example.com"
        computed_candidate = compute_username_candidate(email=email)
        self.assertEqual(computed_candidate, "johndoe")

    def test_compute_username_candidate_without_alphabetical_character(self):
        email = "1234@example.com"
        computed_candidate = compute_username_candidate(email=email)
        self.assertEqual(computed_candidate, "user")


class TestComputeFirstAndLastNameFromEmail(TestCase):
    def test_compute_first_and_last_name_happy_path(self):
        email = "john.doe23@example.com"
        (
            computed_first_name,
            computed_last_name,
        ) = compute_first_and_last_name(email=email)
        self.assertEqual(computed_first_name, "John")
        self.assertEqual(computed_last_name, "Doe")

    def test_compute_first_and_last_name_no_separator(self):
        email = "johndoe23@example.com"
        (
            computed_first_name,
            computed_last_name,
        ) = compute_first_and_last_name(email=email)
        self.assertEqual(computed_first_name, "Johndoe")
        self.assertEqual(computed_last_name, "")

    def test_compute_first_and_last_name_no_letters(self):
        email = "123.456@example.com"
        (
            computed_first_name,
            computed_last_name,
        ) = compute_first_and_last_name(email=email)
        self.assertEqual(computed_first_name, "")
        self.assertEqual(computed_last_name, "")
