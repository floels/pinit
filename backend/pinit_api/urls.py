from django.urls import path
from django.views.generic import TemplateView

from .views import (
    signup,
    authentication,
    accounts,
    pin_creation,
    pin_suggestions,
    pins,
    search_suggestions,
    search,
    boards,
)

urlpatterns = [
    path("doc/", TemplateView.as_view(template_name="redoc.html"), name="doc"),
    path("signup/", signup.sign_up, name="sign_up"),
    path(
        "token/obtain/",
        authentication.obtain_token_pair,
        name="obtain_token",
    ),
    path(
        "token/obtain-demo/",
        authentication.obtain_demo_token_pair,
        name="obtain_demo_token",
    ),
    path(
        "token/refresh/",
        authentication.RefreshTokenView.as_view(),
        name=("refresh_token"),
    ),
    path(
        "accounts/me/",
        accounts.GetMyAccountDetailsView.as_view(),
        name="get_my_account_details",
    ),
    path(
        "accounts/<str:username>/",
        accounts.GetAccountPublicDetailsView.as_view(),
        name="get_account_details",
    ),
    path(
        "pins/<str:unique_id>/",
        pins.GetPinDetailsView.as_view(),
        name="get_pin_details",
    ),
    path(
        "pin-suggestions/",
        pin_suggestions.GetPinSuggestionsView.as_view(),
        name="get_pin_suggestions",
    ),
    path("search/", search.search_pins, name="search_pins"),
    path(
        "search-suggestions/",
        search_suggestions.get_search_suggestions,
        name="get_search_suggestions",
    ),
    path(
        "boards/<str:username>/<str:slug>/",
        boards.GetBoardDetailsView.as_view(),
        name="get_board_details",
    ),
    path("create-pin/", pin_creation.CreatePinView.as_view(), name="create_pin"),
    path(
        "save-pin/",
        pins.SavePinView.as_view(),
        name="save_pin",
    ),
]
