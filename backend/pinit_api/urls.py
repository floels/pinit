from django.urls import path
from django.views.generic import TemplateView
from django.http import JsonResponse

from .views import (
    signup,
    authentication,
    token_refresh,
    accounts,
    pin_creation,
    pin_image_upload_url,
    pin_suggestions,
    pins,
    search_suggestions,
    search,
    boards,
)

urlpatterns = [
    path("health/", lambda request: JsonResponse({"status": "ok"}), name="health"),
    path("doc/", TemplateView.as_view(template_name="redoc.html"), name="doc"),
    # TODO: include 'mobile' in the URL path for all mobile auth endpoints (e.g. 'token/refresh/' -> 'token/mobile/refresh/')
    path("signup/", signup.sign_up_mobile, name="sign_up_mobile"),
    path(
        "token/obtain/",
        authentication.obtain_token_pair_mobile,
        name="obtain_token",
    ),
    path(
        "token/refresh/",
        token_refresh.RefreshTokenMobileView.as_view(),
        name="refresh_token",
    ),
    path("signup/web/", signup.sign_up_web, name="sign_up_web"),
    path(
        "token/web/obtain/",
        authentication.obtain_token_pair_web,
        name="web_obtain_token",
    ),
    path(
        "token/web/refresh/",
        token_refresh.RefreshTokenWebView.as_view(),
        name="web_refresh_token",
    ),
    path("token/web/logout/", authentication.log_out_web, name="log_out_web"),
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
    path(
        "pin-image-upload-url/",
        pin_image_upload_url.GetPinImageUploadUrlView.as_view(),
        name="get_pin_image_upload_url",
    ),
    path("create-pin/", pin_creation.CreatePinView.as_view(), name="create_pin"),
    path(
        "save-pin/",
        pins.SavePinView.as_view(),
        name="save_pin",
    ),
]
