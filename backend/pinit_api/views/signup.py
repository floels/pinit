from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from ..lib.utils import (
    compute_username_candidate,
    compute_first_and_last_name,
    compute_initial,
    get_tokens_data,
)
from ..models import Account
from ..serializers import UserCreateSerializer

FORBIDDEN_USERNAMES = [
    "me",  # since '/accounts/me/' URL is reserved (see 'urls.py')
    "pinit",
]


@api_view(["POST"])
def sign_up(request):
    user_serializer = UserCreateSerializer(data=request.data)

    if not user_serializer.is_valid():
        return get_error_response(user_serializer=user_serializer)

    user = user_serializer.save()

    create_personal_account(user=user)

    tokens_data = get_tokens_data(user=user)

    return Response(tokens_data, status=status.HTTP_201_CREATED)


def get_error_response(user_serializer=None):
    flattened_errors = []

    for field_errors in user_serializer.errors.values():
        for error in field_errors:
            flattened_errors.append({"code": str(error)})

    return Response({"errors": flattened_errors}, status=400)


def create_personal_account(user=None):
    email = user.email

    username = compute_default_username_from_email(email=email)
    first_name, last_name = compute_first_and_last_name(email=email)
    initial = compute_initial(email=email)

    Account.objects.create(
        username=username,
        type="personal",
        first_name=first_name,
        last_name=last_name,
        initial=initial,
        owner=user,
    )


def compute_default_username_from_email(email=""):
    username_candidate = compute_username_candidate(email=email)

    return compute_default_username_from_username_candidate(
        username_candidate=username_candidate
    )


def compute_default_username_from_username_candidate(username_candidate=""):
    username_is_already_taken = Account.objects.filter(
        username=username_candidate
    ).exists()

    username_is_forbidden = username_candidate in FORBIDDEN_USERNAMES

    if username_is_already_taken or username_is_forbidden:
        return compute_derived_username(username_candidate=username_candidate)

    return username_candidate


def compute_derived_username(username_candidate=""):
    accounts_with_username_starting_with_candidate = Account.objects.filter(
        username__startswith=username_candidate
    )

    usernames_starting_with_candidate = [
        account.username for account in accounts_with_username_starting_with_candidate
    ]

    # Starting from 1, we increment a suffix until the resulting username does not already exist:
    suffix = 1

    while True:
        derived_username = f"{username_candidate}{suffix}"

        if (
            derived_username not in usernames_starting_with_candidate
            and derived_username not in FORBIDDEN_USERNAMES
        ):
            break

        suffix += 1

    return derived_username
