import json
from functools import wraps

import jwt
import requests
from django.contrib.auth import authenticate
from django.http import JsonResponse
from jwt import algorithms

from django_project.settings import AUTH0_DOMAIN, AUTH0_IDENTIFIER


def jwt_get_username_from_payload_handler(payload):
    username = payload.get("sub").replace("|", ".")
    authenticate(remote_user=username)
    return username


def jwt_decode_token(token):
    header = jwt.get_unverified_header(token)
    jwks = requests.get(AUTH0_DOMAIN + ".well-known/jwks.json").json()
    public_key = None
    for jwk in jwks["keys"]:
        if jwk["kid"] == header["kid"]:
            public_key = algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))

    if public_key is None:
        raise Exception("Public key not found.")

    return jwt.decode(
        token,
        public_key,
        audience=AUTH0_IDENTIFIER,
        issuer=AUTH0_DOMAIN,
        algorithms=["RS256"],
    )


def get_token_auth_header(request):
    """Obtains the Access Token from the Authorization Header"""
    auth = request.META.get("HTTP_AUTHORIZATION", None)
    parts = auth.split()
    token = parts[1]

    return token


def requires_scopes(required_scopes: list[str]):
    """Determines if the required scope is present in the Access Token
    Args:
        required_scope (str): The scope required to access the resource
    """

    def require_scope(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = get_token_auth_header(args[1])
            decoded = jwt_decode_token(token)
            if decoded.get("scope"):
                token_scopes = decoded["scope"].split()
                scope_checks = [scope in token_scopes for scope in required_scopes]
                if all(scope_checks):
                    return f(*args, **kwargs)
            response = JsonResponse(
                {"message": "You don't have access to this resource"}
            )
            response.status_code = 403
            return response

        return decorated

    return require_scope
