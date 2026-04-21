from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, views

from ..models import Pin, Board, PinInBoard
from ..serializers import PinWithFullDetailsReadSerializer
from ..lib.constants import (
    ERROR_CODE_PIN_NOT_FOUND,
    ERROR_CODE_BOARD_NOT_FOUND,
    ERROR_CODE_FORBIDDEN,
)


class GetPinDetailsView(generics.RetrieveAPIView):
    queryset = Pin.objects.all()
    serializer_class = PinWithFullDetailsReadSerializer
    lookup_field = "unique_id"


class SavePinView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pin_unique_id = request.data.get("pin_id")
        board_unique_id = request.data.get("board_id")

        pin = Pin.objects.filter(unique_id=pin_unique_id).first()
        if not pin:
            return self.get_response_pin_not_found()

        board = Board.objects.filter(unique_id=board_unique_id).first()
        if not board:
            return self.get_response_board_not_found()

        if not self.check_user_is_board_author(user=request.user, board=board):
            return self.get_response_forbidden()

        was_updated = self.update_or_create_pin_in_board(pin=pin, board=board)

        return self.get_ok_response(
            pin_unique_id=pin_unique_id,
            board_unique_id=board_unique_id,
            was_updated=was_updated,
        )

    def check_user_is_board_author(self, user=None, board=None):
        return board.author == user.account

    def update_or_create_pin_in_board(self, pin=None, board=None):
        now = timezone.now()

        self.update_last_pin_added_at(board=board, date=now)

        existing_pin_save = PinInBoard.objects.filter(pin=pin, board=board).first()

        if existing_pin_save:
            existing_pin_save.last_saved_at = now
            existing_pin_save.save()

        else:
            board.pins.add(pin)

        was_updated = existing_pin_save is not None

        return was_updated

    def update_last_pin_added_at(self, board=None, date=None):
        board.last_pin_added_at = date
        board.save()

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
