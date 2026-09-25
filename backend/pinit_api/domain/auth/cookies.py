from django.conf import settings

from pinit_api.shared.constants import REFRESH_TOKEN_COOKIE_NAME


def set_refresh_token_cookie(response, refresh_token):
    # Production uses HTTPS: SameSite=None + Secure for cross-domain support.
    # Development uses HTTP on localhost: SameSite=Lax so the browser accepts
    # the cookie (Chromium rejects SameSite=None without Secure on HTTP).
    samesite = "None" if not settings.DEBUG else "Lax"
    response.set_cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite=samesite,
        max_age=30 * 24 * 60 * 60,
        path="/",
    )


def clear_refresh_token_cookie(response):
    response.delete_cookie(REFRESH_TOKEN_COOKIE_NAME, path="/")
