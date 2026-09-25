from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, views
from rest_framework.exceptions import NotFound

from ..models import Pin, Board, Account
from ..serializers.pin_serializers import PinWithFullDetailsReadSerializer
from pinit_api.domain.boards import save_pin_to_board
from pinit_api.shared.constants import (
    ERROR_CODE_PIN_NOT_FOUND,
    ERROR_CODE_BOARD_NOT_FOUND,
    ERROR_CODE_FORBIDDEN,
    ERROR_CODE_ACCOUNT_NOT_FOUND,
)


class PinView(views.APIView):
    def get(self, request, unique_id):
        pin, error_response = self.get_pin_or_error(unique_id)
        if error_response:
            return error_response

        serializer = PinWithFullDetailsReadSerializer(pin)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, unique_id):
        pin, error_response = self.get_owned_pin_or_error(request, unique_id)
        if error_response:
            return error_response

        if "title" in request.data:
            pin.title = request.data["title"]
        if "description" in request.data:
            pin.description = request.data["description"]
        pin.save()

        serializer = PinWithFullDetailsReadSerializer(pin)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, unique_id):
        pin, error_response = self.get_owned_pin_or_error(request, unique_id)
        if error_response:
            return error_response

        pin.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_pin_or_error(self, unique_id):
        pin = Pin.get_by_unique_id(unique_id)
        if not pin:
            return None, Response(
                {"errors": [{"code": ERROR_CODE_PIN_NOT_FOUND}]},
                status=status.HTTP_404_NOT_FOUND,
            )
        return pin, None

    def get_owned_pin_or_error(self, request, unique_id):
        if not request.user.is_authenticated:
            return None, Response(status=status.HTTP_401_UNAUTHORIZED)

        pin, error_response = self.get_pin_or_error(unique_id)
        if error_response:
            return None, error_response

        if pin.author != request.user.account:
            return None, Response(
                {"errors": [{"code": ERROR_CODE_FORBIDDEN}]},
                status=status.HTTP_403_FORBIDDEN,
            )

        return pin, None


class GetCreatedPinsView(generics.ListAPIView):
    serializer_class = PinWithFullDetailsReadSerializer

    def get_queryset(self):
        username = self.kwargs["username"]
        if not Account.objects.filter(username=username).exists():
            raise NotFound()
        return Pin.objects.filter(author__username=username).order_by("-created_at")


class SavePinView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, unique_id):
        pin_unique_id = unique_id
        board_unique_id = request.data.get("board_id")

        pin = Pin.get_by_unique_id(pin_unique_id)
        if not pin:
            return self.get_response_pin_not_found()

        board = Board.get_by_unique_id(board_unique_id)
        if not board:
            return self.get_response_board_not_found()

        if board.author != request.user.account:
            return self.get_response_forbidden()

        _, created = save_pin_to_board(pin, board)

        return self.get_ok_response(
            pin_unique_id=pin_unique_id,
            board_unique_id=board_unique_id,
            was_updated=not created,
        )

    def get_response_pin_not_found(self):
        return Response(
            {"errors": [{"code": ERROR_CODE_PIN_NOT_FOUND}]},
            status=status.HTTP_404_NOT_FOUND,
        )

    def get_response_board_not_found(self):
        return Response(
            {"errors": [{"code": ERROR_CODE_BOARD_NOT_FOUND}]},
            status=status.HTTP_404_NOT_FOUND,
        )

    def get_response_forbidden(self):
        return Response(
            {"errors": [{"code": ERROR_CODE_FORBIDDEN}]},
            status=status.HTTP_403_FORBIDDEN,
        )

    def get_ok_response(self, pin_unique_id="", board_unique_id="", was_updated=False):
        return Response(
            {"pin_id": pin_unique_id, "board_id": board_unique_id},
            status=status.HTTP_200_OK if was_updated else status.HTTP_201_CREATED,
        )
