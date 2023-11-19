from enum import StrEnum

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from pydantic import BaseModel


class WebsocketEventTypes(StrEnum):
    UPDATE_AVAILABILITY = "update_availability"


class WebsocketService:
    def __init__(
        self,
    ):
        self.channel_layer = get_channel_layer()

    def send_message(
        self, practice_id: int, type_event: WebsocketEventTypes, message: BaseModel
    ):
        async_to_sync(self.channel_layer.group_send)(
            "practice_" + str(practice_id),
            {
                "type": type_event.value,
                "message": message.json(),
            },
        )
