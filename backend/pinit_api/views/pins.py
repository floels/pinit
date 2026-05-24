from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, views
from rest_framework.exceptions import NotFound

from ..models import Pin, Board, PinInBoard, Account
from ..serializers.pin_serializers import PinWithFullDetailsReadSerializer
from ..lib.constants import (
    ERROR_CODE_PIN_NOT_FOUND,
    ERROR_CODE_BOARD_NOT_FOUND,
    ERROR_CODE_FORBIDDEN,
    ERROR_CODE_ACCOUNT_NOT_FOUND,
)


class PinView(views.APIView):
    def get(self, request, unique_id):
        pin = Pin.objects.filter(unique_id=unique_id).first()
        if not pin:
            return Response(
                {"errors": [{"code": ERROR_CODE_PIN_NOT_FOUND}]},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PinWithFullDetailsReadSerializer(pin)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, unique_id):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        pin = Pin.objects.filter(unique_id=unique_id).first()
        if not pin:
            return Response(
                {"errors": [{"code": ERROR_CODE_PIN_NOT_FOUND}]},
                status=status.HTTP_404_NOT_FOUND,
            )

        if pin.author != request.user.account:
            return Response(
                {"errors": [{"code": ERROR_CODE_FORBIDDEN}]},
                status=status.HTTP_403_FORBIDDEN,
            )

        if "title" in request.data:
            pin.title = request.data["title"]
        if "description" in request.data:
            pin.description = request.data["description"]
        pin.save()

        serializer = PinWithFullDetailsReadSerializer(pin)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, unique_id):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        pin = Pin.objects.filter(unique_id=unique_id).first()
        if not pin:
            return Response(
                {"errors": [{"code": ERROR_CODE_PIN_NOT_FOUND}]},
                status=status.HTTP_404_NOT_FOUND,
            )

        if pin.author != request.user.account:
            return Response(
                {"errors": [{"code": ERROR_CODE_FORBIDDEN}]},
                status=status.HTTP_403_FORBIDDEN,
            )

        pin.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Keep old name as alias for backward compatibility
GetPinDetailsView = PinView


class GetCreatedPinsView(generics.ListAPIView):
    serializer_class = PinWithFullDetailsReadSerializer

    def get_queryset(self):
        username = self.kwargs["username"]
        if not Account.objects.filter(username=username).exists():
            raise NotFound()
        return Pin.objects.filter(author__username=username).order_by("-created_at")


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
