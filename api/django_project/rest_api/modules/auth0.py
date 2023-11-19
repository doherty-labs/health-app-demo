from unittest.mock import MagicMock
from urllib.parse import urlsplit

from auth0.v3.authentication import Database
from auth0.v3.authentication.get_token import GetToken
from auth0.v3.management.connections import Connections
from auth0.v3.management.organizations import Organizations
from auth0.v3.management.users import Users
from auth0.v3.management.users_by_email import UsersByEmail
from injector import Module, provider

from django_project import settings
from rest_api.services.auth0 import Auth0Service


class Auth0Module(Module):
    domain = settings.AUTH0_DOMAIN
    staff_client_id = settings.AUTH0_STAFF_APP_CLIENT_ID
    customer_client_id = settings.AUTH0_CUSTOMER_APP_CLIENT_ID
    connection_id = settings.AUTH0_STAFF_APP_CONNECTION_ID
    domain_host = urlsplit(domain).hostname

    m2m_client_id = settings.AUTH0_M2M_CLIENT_ID
    m2m_client_secret = settings.AUTH0_M2M_CLIENT_SECRET
    m2m_audience = "https://{}/api/v2/".format(domain_host)

    @provider
    def get_token(self) -> GetToken:
        return GetToken(domain=self.domain_host)

    @provider
    def access_token(self, get_token: GetToken) -> str:
        return get_token.client_credentials(
            client_id=self.m2m_client_id,
            client_secret=self.m2m_client_secret,
            audience=self.m2m_audience,
        )["access_token"]

    @provider
    def connections(self, access_token: str) -> Connections:
        return Connections(domain=self.domain_host, token=access_token)

    @provider
    def organization(self, access_token: str) -> Organizations:
        return Organizations(domain=self.domain_host, token=access_token)

    @provider
    def users(self, access_token: str) -> Users:
        return Users(domain=self.domain_host, token=access_token)

    @provider
    def users_by_email(self, access_token: str) -> UsersByEmail:
        return UsersByEmail(domain=self.domain_host, token=access_token)

    @provider
    def database(self) -> Database:
        return Database(domain=self.domain_host)

    @provider
    def service(
        self,
        connections: Connections,
        organization: Organizations,
        users: Users,
        users_by_email: UsersByEmail,
        database: Database,
    ) -> Auth0Service:
        return Auth0Service(
            connections=connections,
            org=organization,
            users=users,
            database=database,
            staff_client_id=self.staff_client_id,
            connection_id=self.connection_id,
            customer_client_id=self.customer_client_id,
            users_by_email=users_by_email,
        )


class TestAuth0Module(Module):
    @provider
    def service(self) -> Auth0Service:
        return MagicMock()
