from rest_framework import serializers
from ..models import Board
from .common_serializers import AccountBaseReadSerializer
from .board_serializers import BoardWithBasicDetailsReadSerializer


class AccountWithBoardsReadSerializer(AccountBaseReadSerializer):
    boards = serializers.SerializerMethodField()

    class Meta(AccountBaseReadSerializer.Meta):
        fields = AccountBaseReadSerializer.Meta.fields + ("boards",)

    def get_boards(self, obj):
        ordered_boards = Board.objects.filter(author=obj).order_by(
            "-last_pin_added_at", "-created_at"
        )
        return BoardWithBasicDetailsReadSerializer(ordered_boards, many=True).data


class AccountWithPublicDetailsReadSerializer(AccountWithBoardsReadSerializer):
    class Meta(AccountWithBoardsReadSerializer.Meta):
        fields = AccountWithBoardsReadSerializer.Meta.fields + (
            "background_picture_url",
            "description",
        )


class AccountWithPrivateDetailsReadSerializer(AccountWithPublicDetailsReadSerializer):
    owner_email = serializers.SerializerMethodField()

    class Meta(AccountWithPublicDetailsReadSerializer.Meta):
        fields = AccountWithPublicDetailsReadSerializer.Meta.fields + (
            "type",
            "owner_email",
        )

    def get_owner_email(self, obj):
        return obj.owner.email
