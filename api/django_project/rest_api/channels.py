from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer


class AvailabilityConsumer(JsonWebsocketConsumer):
    def update_availability(self, event):
        message = event["message"]
        self.send_json(message)

    def connect(self):
        super().connect()
        practiceID = self.scope.get("url_route").get("kwargs").get("practiceID")
        async_to_sync(self.channel_layer.group_add)(
            "practice_" + str(practiceID), self.channel_name
        )

    def disconnect(self, close_code):
        self.close()


class TaskProgressConsumer(JsonWebsocketConsumer):
    def celery_task_update(self, event):
        message = event["message"]
        self.send_json(message)

    def connect(self):
        super().connect()
        taskID = self.scope.get("url_route").get("kwargs").get("taskID")
        async_to_sync(self.channel_layer.group_add)(taskID, self.channel_name)

    def receive(self, text_data=None, bytes_data=None, **kwargs):
        self.send(text_data="Hello world!")

    def disconnect(self, close_code):
        self.close()
