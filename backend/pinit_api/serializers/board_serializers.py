from rest_framework import serializers
from ..models import Board, PinInBoard
from .common_serializers import AccountBaseReadSerializer
from .pin_serializers import PinWithAuthorDetailsReadSerializer

NUMBER_FIRST_IMAGES = 3


class BoardReadBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = (
            "unique_id",
            "name",
            "slug",
        )


class BoardWithBasicDetailsReadSerializer(BoardReadBaseSerializer):
    first_image_urls = serializers.SerializerMethodField()

    class Meta(BoardReadBaseSerializer.Meta):
        fields = BoardReadBaseSerializer.Meta.fields + ("first_image_urls",)

    def get_first_image_urls(self, obj):
        oldest_pins_in_board = PinInBoard.objects.filter(board=obj).order_by(
            "last_saved_at"
        )[:NUMBER_FIRST_IMAGES]

        return [pin_in_board.pin.image_url for pin_in_board in oldest_pins_in_board]


class BoardWithFullDetailsReadSerializer(BoardReadBaseSerializer):
    author = AccountBaseReadSerializer(read_only=True)
    pins = serializers.SerializerMethodField()

    class Meta(BoardReadBaseSerializer.Meta):
        fields = BoardReadBaseSerializer.Meta.fields + (
            "author",
            "pins",
        )

    def get_pins(self, obj):
        pin_in_boards = PinInBoard.objects.filter(board=obj).order_by("-last_saved_at")

        pins = [pin_in_board.pin for pin_in_board in pin_in_boards]

        return PinWithAuthorDetailsReadSerializer(pins, many=True).data
