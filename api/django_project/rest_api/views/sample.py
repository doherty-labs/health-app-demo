from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

UserModel = get_user_model()


class AuthViewTest(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            data={"names": ["bill", "bob", "keanu", "logan"]}, status=status.HTTP_200_OK
        )
