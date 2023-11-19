from auth0.v3.authentication import Database
from auth0.v3.exceptions import Auth0Error
from auth0.v3.management.connections import Connections
from auth0.v3.management.organizations import Organizations
from auth0.v3.management.users import Users
from auth0.v3.management.users_by_email import UsersByEmail
from injector import inject, noninjectable

from django_project import settings


class Auth0Service:
    @inject
    @noninjectable("staff_client_id", "connection_id", "customer_client_id")
    def __init__(
        self,
        org: Organizations,
        connections: Connections,
        users: Users,
        users_by_email: UsersByEmail,
        database: Database,
        staff_client_id: str,
        connection_id: str,
        customer_client_id: str,
    ):
        self.org = org
        self.connections = connections
        self.users = users
        self.database = database
        self.staff_client_id = staff_client_id
        self.connection_id = connection_id
        self.customer_client_id = customer_client_id
        self.users_by_email = users_by_email

    def add_org(self, org_name: str, slug: str) -> str:
        return self.org.create_organization(
            {
                "name": slug,
                "display_name": org_name,
                "enabled_connections": [
                    {
                        "connection_id": self.connection_id,
                        "assign_membership_on_login": False,
                    }
                ],
            }
        ).get("id")

    def add_org_user(self, org_id: str, email: str, roles: list[str] = []):
        return self.org.create_organization_invitation(
            org_id,
            {
                "inviter": {"name": "GPBase Admin"},
                "invitee": {"email": email},
                "client_id": self.staff_client_id,
                "connection_id": self.connection_id,
                "app_metadata": {},
                "user_metadata": {},
                "ttl_sec": 0,
                "send_invitation_email": True,
                "roles": roles,
            },
        )

    def signup_patient(self, email: str, password: str) -> str:
        user_id: str = ""
        try:
            signup_req = self.database.signup(
                email=email,
                password=password,
                connection="Username-Password-Authentication",
                client_id=self.customer_client_id,
            )
            user_id = "auth0|" + signup_req.get("_id")
            self.database.change_password(
                client_id=self.customer_client_id,
                connection="Username-Password-Authentication",
                email=email,
            )
        except Auth0Error:
            user_id = self.users_by_email.search_users_by_email(email=email)[0].get(
                "user_id"
            )

        user_id = user_id.replace("|", "auth0.")
        return user_id

    def delete_user(self, user_id: str):
        return self.users.delete(user_id)

    def delete_org(self, id: str):
        return self.org.delete_organization(id)

    def assign_patient_role(self, id: str):
        user_id = id.replace(".", "|")
        return self.users.add_roles(user_id, [settings.AUTH0_PATIENT_ROLE_ID])

    def assign_staff_role(self, id: str):
        user_id = id.replace(".", "|")
        return self.users.add_roles(user_id, [settings.AUTH0_STAFF_ROLE_ID])
