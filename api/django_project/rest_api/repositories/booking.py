from datetime import timedelta

from django.db import transaction
from django.db.transaction import atomic
from django.utils import timezone
from ics import Calendar, Event
from injector import inject

from rest_api.models.booking import BookingInviteModel, BookingModel
from rest_api.repositories.appointment import AppointmentRepo
from rest_api.repositories.availability import AvailabilityRepo
from rest_api.repositories.common import CommonModelRepo
from rest_api.repositories.practice import PracticeRepo
from rest_api.repositories.staff import StaffRepo
from rest_api.repositories.user import UserRepo
from rest_api.schemas.availability import AvailableAppointmentSchema
from rest_api.schemas.booking import BookingInviteSchema, BookingSchema
from rest_api.schemas.common import StateSchema
from rest_api.services.elastic_indexes.booking import BookingIndex
from rest_api.services.notification import NotificationService
from rest_api.services.websocket import WebsocketEventTypes, WebsocketService
from rest_api.utils.elastic_migration import ElasticMigration


class BookingRepo(CommonModelRepo[BookingSchema]):
    elastic_service: BookingIndex
    staff_repo: StaffRepo
    user_repo: UserRepo
    websocket_service: WebsocketService
    appointment_repo: AppointmentRepo
    availability_repo: AvailabilityRepo
    notification_service: NotificationService
    practice_repo: PracticeRepo

    attendance_states: list[StateSchema] = [
        StateSchema(id="no_show", description="Patient did not attend", name="No Show"),
        StateSchema(id="attended", description="Patient attended", name="Attended"),
        StateSchema(
            id="cancelled", description="Appointment was cancelled", name="Cancelled"
        ),
    ]

    @inject
    def __init__(
        self,
        elastic_service: BookingIndex,
        staff_repo: StaffRepo,
        websocket_service: WebsocketService,
        appointment_repo: AppointmentRepo,
        availability_repo: AvailabilityRepo,
        user_repo: UserRepo,
        notification_service: NotificationService,
        practice_repo: PracticeRepo,
    ):
        super(BookingRepo, self).__init__(es_instance=elastic_service)
        self.elastic_service = elastic_service
        self.staff_repo = staff_repo
        self.websocket_service = websocket_service
        self.appointment_repo = appointment_repo
        self.availability_repo = availability_repo
        self.user_repo = user_repo
        self.notification_service = notification_service
        self.practice_repo = practice_repo

    def get(self, id: int) -> BookingSchema:
        booking = BookingModel.objects.get(id=id)
        invitation = (
            BookingInviteModel.objects.filter(appointment_id=booking.appointment.id)
            .order_by("-created_at")
            .first()
        )
        return BookingSchema(
            id=booking.id,
            appointment_id=booking.appointment.id,
            appointment=self.appointment_repo.get(booking.appointment.id),
            attendance_status=booking.attendance_status,
            available_appointment_id=booking.available_appointment.id,
            available_appointment=self.availability_repo.get(
                booking.available_appointment.id
            ),
            booked_by_id=booking.booked_by.id,
            booked_by=self.user_repo.get(booking.booked_by.id),
            created_at=booking.created_at,
            updated_at=booking.updated_at,
            invitation=BookingInviteSchema(
                id=invitation.id,
                appointment=self.appointment_repo.get(invitation.appointment.id),
                appointment_id=invitation.appointment.id,
                created_at=invitation.created_at,
                practice_id=invitation.practice.id,
                staff_id=invitation.staff.id,
                staff=self.staff_repo.get(invitation.staff.id),
                updated_at=invitation.updated_at,
            ),
            invitation_id=invitation.id if invitation else None,
        )

    @atomic
    def create(self, data: BookingSchema) -> BookingSchema:
        booking = BookingModel.objects.create(
            appointment_id=data.appointment_id,
            available_appointment_id=data.available_appointment_id,
            booked_by_id=data.booked_by_id,
            attendance_status=data.attendance_status,
            invitation_id=data.invitation_id if data.invitation_id else None,
        )
        result = self.get(booking.id)
        transaction.on_commit(
            lambda: self.elastic_service.add(id=booking.id, doc_data=result)
        )
        return self.get(booking.id)

    @atomic
    def update(self, id: int, data: BookingSchema) -> BookingSchema:
        booking = BookingModel.objects.get(id=id)
        booking.attendance_status = data.attendance_status
        apt = self.appointment_repo.get(booking.appointment.id)
        if data.attendance_status == "cancelled":
            patient_email = (
                booking.appointment.patient.user.email
                if booking.appointment.patient
                else booking.booked_by.email
            )
            doctor_name = (
                f"{booking.available_appointment.team_member.first_name} {booking.available_appointment.team_member.last_name}"
                if booking.available_appointment.team_member
                else ""
            )
            cancel_confirmation = f"Your appointment has been cancelled for {booking.available_appointment.start_time} - {booking.available_appointment.end_time} with {doctor_name}"
            transaction.on_commit(
                lambda: self.notification_service.send_email(
                    to_emails=[
                        patient_email,
                    ],
                    subject="Appointment Cancelled",
                    text=cancel_confirmation,
                )
            )

            transaction.on_commit(
                lambda: self.websocket_service.send_message(
                    practice_id=booking.appointment.practice.id,
                    type_event=WebsocketEventTypes.UPDATE_AVAILABILITY,
                    message=self.availability_repo.get(
                        booking.available_appointment.id
                    ),
                )
            )

            apt.state = "cancelled"
        else:
            apt.state = "booked"
        booking.save()
        self.appointment_repo.update(
            id=apt.id, data=apt, triggered_by_id=data.booked_by_id
        )
        result = self.get(booking.id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=booking.id, doc_data=result)
        )

        return result

    @atomic
    def delete(self, id: int) -> None:
        booking = BookingModel.objects.get(id=id)
        booking.delete()
        transaction.on_commit(lambda: self.elastic_service.remove(id=id))

    @atomic
    def create_invitation(
        self, appointment_id: int, staff_id: int
    ) -> BookingInviteSchema:
        apt = self.appointment_repo.get(appointment_id)
        invitation = BookingInviteModel.objects.create(
            appointment_id=appointment_id,
            staff_id=staff_id,
            practice_id=apt.practice_id,
        )
        if apt.patient:
            link_to_book = f"https://gpbase.co.uk/book/{invitation.id}"
            transaction.on_commit(
                lambda: self.notification_service.send_email(
                    to_emails=[
                        apt.patient.email,
                    ],
                    subject="Booking Invitation",
                    text=f"You have been invited to book an appointment. Link to book: {link_to_book}",
                )
            )

        return self.get_booking_invite(invitation.id)

    def recreate_index(self) -> None:
        queryset = BookingModel.objects.all()
        docs: list[BookingSchema] = []
        chunk_size = 2500
        with ElasticMigration(self.elastic_service):
            for booking in queryset:
                result = self.get(id=booking.id)
                docs.append(result)
                if len(docs) >= chunk_size:
                    self.elastic_service.bulk_add_docs(docs)
                    docs = []

    def search(
        self,
        practice_id: str,
        team_member_id: str | None,
        from_date: str | None,
        to_date: str | None,
        patient_id: str | None,
        appointment_id: str | None,
        size: int = 10,
    ) -> list[BookingSchema]:
        if size > 50:
            size = 50

        must: list[dict] = []

        if appointment_id:
            must.append({"match": {"appointment_id": appointment_id}})

        if patient_id:
            must.append({"match": {"appointment.patient_id": patient_id}})

        if practice_id:
            must.append({"match": {"available_appointment.practice_id": practice_id}})

        if team_member_id:
            must.append(
                {"match": {"available_appointment.team_member_id": team_member_id}}
            )

        if from_date and to_date:
            must.append(
                {
                    "range": {
                        "available_appointment.start_time": {
                            "gte": from_date,
                            "lte": to_date,
                        }
                    }
                }
            )

        search_result = self.elastic_service.search(
            query={"bool": {"must": must}},
            size=size,
        )
        hits = search_result["hits"]["hits"]
        result = list(
            map(
                lambda x: BookingSchema(**x["_source"]),
                hits,
            )
        )
        return result

    def check_appointment_booked(self, availability_id: int) -> bool:
        return BookingModel.objects.filter(
            available_appointment_id=availability_id
        ).exists()

    def check_invitation_booked(self, invitation_id: int) -> bool:
        return BookingModel.objects.filter(invitation_id=invitation_id).exists()

    @atomic
    def submit_booking(self, booking: BookingSchema) -> BookingSchema:
        avail_id = booking.available_appointment_id
        avail = self.availability_repo.get(avail_id)
        apt = self.appointment_repo.get(booking.appointment_id)
        booked_by = self.user_repo.get(booking.booked_by_id)
        is_booked = (
            self.check_appointment_booked(availability_id=avail_id)
            if avail_id
            else False
        )

        if not is_booked:
            booking = self.create(data=booking)
            patient_email = apt.patient.email if apt.patient else booked_by.email
            doctor_name = (
                f"{avail.team_member.first_name} {avail.team_member.last_name}"
                if avail.team_member
                else ""
            )

            formatted_start_date = avail.start_time.strftime("%Y-%m-%d %H:%M:%S")
            formatted_end_date = avail.end_time.strftime("%Y-%m-%d %H:%M:%S")

            practice = self.practice_repo.get(apt.practice_id)
            c = Calendar()
            e = Event()
            e.name = f"Appointment Booked - {doctor_name}"
            e.begin = f"{avail.start_time}"
            e.end = f"{avail.end_time}"
            e.location = f"{practice.name} - {practice.full_address}"
            e.organizer = f"{practice.name}"
            e.description = f"GP Appointment with - {doctor_name}"
            c.events.add(e)
            ics_calendar = c.serialize()

            apt = self.appointment_repo.get(booking.appointment_id)
            apt.state = "booked"
            self.appointment_repo.update(
                id=apt.id, data=apt, triggered_by_id=booking.booked_by_id
            )

            booking_confirmation = f"Your appointment has been booked for {formatted_start_date} - {formatted_end_date} with {doctor_name}"
            transaction.on_commit(
                lambda: self.notification_service.send_email(
                    to_emails=[
                        patient_email,
                    ],
                    subject="Appointment Booked",
                    text=booking_confirmation,
                    ics=ics_calendar,
                )
            )
            transaction.on_commit(
                lambda: self.websocket_service.send_message(
                    practice_id=apt.practice_id,
                    type_event=WebsocketEventTypes.UPDATE_AVAILABILITY,
                    message=avail,
                )
            )
            return booking
        else:
            raise Exception("Appointment is already booked")

    def get_booking_options(
        self,
        practice_id: int,
        team_member_id: int | None,
        from_date: str | None,
        to_date: str | None,
    ) -> list[AvailableAppointmentSchema]:
        availability = self.availability_repo.search(
            practice_id=practice_id,
            team_member_id=team_member_id,
            from_date=from_date,
            to_date=to_date,
            size=50,
        )
        availability_ids = list(map(lambda x: x.id, availability))
        bookings = BookingModel.objects.filter(
            available_appointment_id__in=availability_ids
        )
        booked_ids = list(map(lambda x: x.available_appointment.id, bookings))
        result = list(filter(lambda x: x.id not in booked_ids, availability))
        return result

    def get_booking_invite(self, booking_invite: int) -> BookingInviteSchema:
        invitation = BookingInviteModel.objects.get(
            id=booking_invite,
        )

        is_booked = self.check_invitation_booked(invitation_id=invitation.id)
        is_expired = False
        now = timezone.now()
        one_day = now - timedelta(hours=24)
        if invitation.created_at < one_day:
            is_expired = True

        can_book = not (is_booked or is_expired)

        return BookingInviteSchema(
            id=invitation.id,
            appointment=self.appointment_repo.get(invitation.appointment.id),
            appointment_id=invitation.appointment.id,
            created_at=invitation.created_at,
            practice_id=invitation.practice.id,
            staff_id=invitation.staff.id,
            staff=self.staff_repo.get(invitation.staff.id),
            updated_at=invitation.updated_at,
            can_book=can_book,
        )
