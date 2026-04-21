from rest_framework.views import exception_handler
from rest_framework import status

from ..constants import ERROR_CODE_UNAUTHORIZED


def handle_unauthorized_exception(exc, context):
    """
    Custom exception handler that returns JSON:API-formatted error
    response for 401 Unauthorized status codes.
    """
    response = exception_handler(exc, context)

    if response is not None and response.status_code == status.HTTP_401_UNAUTHORIZED:
        response.content_type = "application/json"
        response.data = {"errors": [{"code": ERROR_CODE_UNAUTHORIZED}]}

    return response
