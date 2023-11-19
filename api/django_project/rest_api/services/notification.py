import requests

from django_project import settings


class NotificationService:
    def __init__(self, mail_gun_key: str, mail_gun_domain: str):
        self.mail_gun_key = mail_gun_key
        self.mail_gun_domain = mail_gun_domain

    def send_email(
        self, to_emails: list[str], subject: str, text: str, ics: str | None = None
    ):
        if not settings.DEBUG:
            send_email = requests.post(
                "https://api.eu.mailgun.net/v3/{}/messages".format(
                    self.mail_gun_domain
                ),
                auth=("api", self.mail_gun_key),
                data={
                    "from": "GPBase Support <noreply@gpbase.co.uk>",
                    "to": to_emails,
                    "subject": subject,
                    "text": text,
                },
                files=[("attachment", ("event.ics", ics.encode()))] if ics else None,
            )
            return send_email
