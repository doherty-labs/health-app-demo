import uuid
from datetime import datetime

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.transaction import atomic
from injector import inject

from rest_api.models.appointment import (
    AppointmentAssignLogModel,
    AppointmentCommentModel,
    AppointmentDocumentModel,
    AppointmentModel,
    AppointmentStateLogModel,
    AppointmentViewedLogModel,
)
from rest_api.models.patient import PatientDocumentModel
from rest_api.repositories.common import CommonModelRepo
from rest_api.repositories.patient import PatientRepo
from rest_api.repositories.user import UserRepo
from rest_api.repositories.utils import convert_patient_id_to_user_id
from rest_api.schemas.appointment import (
    AppointmentAssignSchema,
    AppointmentCommentSchema,
    AppointmentSchema,
    AppointmentStateLogSchema,
    AppointmentViewedLogSchema,
    PatientDocumentSchema,
)
from rest_api.schemas.common import StateSchema
from rest_api.services.elastic_indexes.appointment import AppointmentIndex
from rest_api.services.geo import GeoPyService
from rest_api.services.notification import NotificationService
from rest_api.services.s3 import ObjectStorageService
from rest_api.utils.elastic_migration import ElasticMigration

User = get_user_model()


class AppointmentRepo(CommonModelRepo[AppointmentSchema]):

    elastic_service: AppointmentIndex
    geo_service: GeoPyService
    storage_service: ObjectStorageService
    notification_service: NotificationService
    patient_repo: PatientRepo
    user_repo: UserRepo

    states: list[StateSchema] = [
        StateSchema(
            id="submitted",
            name="Submitted",
            description="Request has been received from patient.",
        ),
        StateSchema(
            id="waiting_triage",
            name="Waiting Triage",
            description="Pending review by team.",
        ),
        StateSchema(
            id="in_triage",
            name="In Triage",
            description="Currently being reviewed by team.",
        ),
        StateSchema(
            id="awaiting_time_selection",
            name="Awaiting Time Selection",
            description="Waiting for patient to select a time.",
        ),
        StateSchema(
            id="booked", name="Booked", description="Patient is booked with a doctor."
        ),
        StateSchema(
            id="cancelled",
            name="Cancelled",
            description="Patient has cancelled there booking request.",
        ),
        StateSchema(
            id="rejected", name="Rejected", description="Request has been denied."
        ),
    ]

    @inject
    def __init__(
        self,
        elastic_service: AppointmentIndex,
        geo_service: GeoPyService,
        storage_service: ObjectStorageService,
        notification_service: NotificationService,
        patient_repo: PatientRepo,
        user_repo: UserRepo,
    ):
        super(AppointmentRepo, self).__init__(es_instance=elastic_service)
        self.elastic_service = elastic_service
        self.geo_service = geo_service
        self.storage_service = storage_service
        self.notification_service = notification_service
        self.patient_repo = patient_repo
        self.user_repo = user_repo

    def get(self, id: int) -> AppointmentSchema:
        appointment = AppointmentModel.objects.get(
            id=id,
        )
        doc_q = AppointmentDocumentModel.objects.filter(appointment_id=id).order_by(
            "-created_at"
        )
        docs: list[PatientDocumentSchema] = []
        for doc in doc_q:
            docs.append(
                PatientDocumentSchema(
                    id=doc.id,
                    download_url=doc.document.s3_url,
                    uploaded_at=doc.document.uploaded_at,
                )
            )

        logs_q = AppointmentStateLogModel.objects.filter(appointment_id=id).order_by(
            "-created_at"
        )
        logs: list[AppointmentStateLogSchema] = []
        for log in logs_q:
            if log.transition_away_at is not None:
                diff_dates = (log.transition_away_at - log.created_at).total_seconds()
            else:
                diff_dates = None
            logs.append(
                AppointmentStateLogSchema(
                    id=log.id,
                    appointment_id=log.appointment.id,
                    created_at=log.created_at,
                    from_state=log.from_state,
                    to_state=log.to_state,
                    triggered_by_id=log.triggered_by.id,
                    triggered_by=self.user_repo.get(log.triggered_by.id),
                    transition_away_at=log.transition_away_at,
                    transition_delta=diff_dates,
                )
            )

        comments_q = AppointmentCommentModel.objects.filter(appointment_id=id).order_by(
            "-created_at"
        )
        comments: list[AppointmentCommentSchema] = []
        for comm in comments_q:
            comments.append(
                AppointmentCommentSchema(
                    id=comm.id,
                    comment=comm.comment,
                    created_at=comm.created_at,
                    appointment_id=comm.appointment.id,
                    updated_at=comm.updated_at,
                    user_id=comm.user.id,
                    user=self.user_repo.get(comm.user.id),
                )
            )

        assign_logs_q = AppointmentAssignLogModel.objects.filter(
            appointment_id=id
        ).order_by("-created_at")
        assign_logs: list[AppointmentAssignSchema] = []
        for log in assign_logs_q:
            assign_logs.append(
                AppointmentAssignSchema(
                    id=log.id,
                    appointment_id=log.appointment.id,
                    created_at=log.created_at,
                    from_user=self.user_repo.get(log.from_user.id)
                    if log.from_user
                    else None,
                    to_user=self.user_repo.get(log.to_user.id) if log.to_user else None,
                    triggered_by=self.user_repo.get(log.triggered_by.id)
                    if log.triggered_by
                    else None,
                )
            )

        patient = self.patient_repo.get(appointment.patient.id)

        if appointment.assigned_to:
            assigned_to = self.user_repo.get(appointment.assigned_to.id)
        else:
            assigned_to = None

        viewed_history_q = AppointmentViewedLogModel.objects.filter(
            appointment_id=id
        ).order_by("-created_at")
        viewed_history: list[AppointmentViewedLogSchema] = []

        for item in viewed_history_q:
            viewed_history.append(
                AppointmentViewedLogSchema(
                    id=item.id,
                    appointment_id=item.appointment.id,
                    created_at=item.created_at,
                    viewed_by=self.user_repo.get(item.viewed_by.id),
                )
            )

        return AppointmentSchema(
            id=appointment.id,
            created_at=appointment.created_at,
            patient_id=appointment.patient.id,
            practice_id=appointment.practice.id,
            assigned_to_id=appointment.assigned_to.id
            if appointment.assigned_to
            else None,
            priority=appointment.priority,
            state=appointment.state,
            symptom_category=appointment.symptom_category,
            symptoms=appointment.symptoms,
            documents=docs,
            symptoms_duration_seconds=appointment.symptoms_duration_seconds,
            updated_at=appointment.updated_at,
            logs=logs,
            comments=comments,
            patient=patient,
            assigned_to=assigned_to,
            assign_history=assign_logs,
            viewed_logs=viewed_history,
        )

    def get_with_tracking(self, id: int, viewed_by: int) -> AppointmentSchema:
        if viewed_by is not None:
            AppointmentViewedLogModel.objects.create(
                appointment_id=id, viewed_by_id=viewed_by
            )
        result = self.get(id=id)
        self.elastic_service.update(id=id, doc_data=result)
        return result

    @atomic
    def create(self, data: AppointmentSchema) -> AppointmentSchema:
        app = AppointmentModel.objects.create(
            symptoms=data.symptoms,
            symptom_category=data.symptom_category,
            symptoms_duration_seconds=data.symptoms_duration_seconds,
            priority=data.priority,
            state=data.state,
            patient_id=data.patient_id,
            practice_id=data.practice_id,
        )

        user_id = convert_patient_id_to_user_id(data.patient_id)
        AppointmentStateLogModel.objects.create(
            appointment_id=app.id,
            from_state="",
            to_state=data.state,
            triggered_by_id=user_id,
        )

        self.patient_repo.add_practice_link(
            patient_id=data.patient_id, practice_id=data.practice_id
        )
        result = self.get(app.id)
        transaction.on_commit(
            lambda: self.elastic_service.add(id=app.id, doc_data=result)
        )
        return result

    @atomic
    def update(
        self, id: int, data: AppointmentSchema, triggered_by_id: int
    ) -> AppointmentSchema:
        new_state = data.state

        if new_state not in [s.id for s in self.states]:
            raise ValueError(f"Invalid state {new_state}")

        old_state = AppointmentModel.objects.get(id=id).state
        if new_state != old_state:
            latest_state = (
                AppointmentStateLogModel.objects.filter(appointment_id=id)
                .order_by("-created_at")
                .first()
            )
            if latest_state:
                latest_state.transition_away_at = datetime.now()
                latest_state.save()
            AppointmentStateLogModel.objects.create(
                appointment_id=id,
                from_state=old_state,
                to_state=new_state,
                triggered_by_id=triggered_by_id,
            )

            patient_email = AppointmentModel.objects.get(id=id).patient.user.email
            transaction.on_commit(
                lambda: self.notification_service.send_email(
                    to_emails=[patient_email],
                    subject="Appointment State Change",
                    text=f"Your appointment state has changed from {old_state} to {new_state}",
                )
            )

        old_assigned_to = AppointmentModel.objects.get(id=id).assigned_to
        old_assigned_to_id: int | None = old_assigned_to.id if old_assigned_to else None
        new_assigned_to_id = data.assigned_to_id
        if old_assigned_to_id != new_assigned_to_id:
            AppointmentAssignLogModel.objects.create(
                from_user_id=old_assigned_to_id,
                to_user_id=new_assigned_to_id,
                triggered_by_id=triggered_by_id,
                appointment_id=id,
            )

        if data.comments:
            comment_ids = list(map(lambda x: x.id, data.comments))
            AppointmentCommentModel.objects.filter(appointment_id=id).exclude(
                id__in=comment_ids
            ).delete()

            for comment in data.comments:
                if comment.id is None:
                    AppointmentCommentModel.objects.create(
                        appointment_id=comment.appointment_id,
                        user_id=triggered_by_id,
                        comment=comment.comment,
                    )

                AppointmentCommentModel.objects.filter(id=comment.id).update(
                    comment=comment.comment,
                    user_id=comment.user_id,
                )

        AppointmentModel.objects.filter(id=id).update(
            symptoms=data.symptoms,
            symptom_category=data.symptom_category,
            symptoms_duration_seconds=data.symptoms_duration_seconds,
            priority=data.priority,
            state=data.state,
            patient_id=data.patient_id,
            practice_id=data.practice_id,
            assigned_to_id=data.assigned_to_id,
        )
        result = self.get(id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=id, doc_data=result)
        )
        return result

    @atomic
    def delete(self, id: int):
        app = AppointmentModel.objects.get(id=id)
        doc_q = AppointmentDocumentModel.objects.filter(appointment_id=id)
        for doc in doc_q:
            self.delete_document(doc.id)
        app.delete()
        transaction.on_commit(lambda: self.elastic_service.remove(id=id))

    @atomic
    def create_upload_appointment_file(
        self, appointment_id: int, extension: str
    ) -> str:
        app = self.get(id=appointment_id)
        key = f"appointment/{appointment_id}/{uuid.uuid4()}.{extension}"
        upload_url = self.storage_service.gen_upload_url(key)
        doc = PatientDocumentModel.objects.create(patient_id=app.patient_id, s3_url=key)
        AppointmentDocumentModel.objects.create(
            appointment_id=appointment_id,
            document=doc,
            patient_id=app.patient_id,
            practice_id=app.practice_id,
        )
        result = self.get(appointment_id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=appointment_id, doc_data=result)
        )
        return upload_url

    @atomic
    def delete_document(self, id: int) -> None:
        ver = AppointmentDocumentModel.objects.get(id=id)
        doc = ver.document
        transaction.on_commit(lambda: self.storage_service.delete_object(doc.s3_url))
        doc.delete()
        result = self.get(ver.id)
        transaction.on_commit(
            lambda: self.elastic_service.update(id=ver.id, doc_data=result)
        )

    def get_download_url(self, id: int) -> str:
        doc = AppointmentDocumentModel.objects.get(id=id)
        return self.storage_service.gen_download_url(doc.document.s3_url)

    def search(self, term: str, size: int = 10) -> list[AppointmentSchema]:
        if size > 50:
            size = 50

        search_result = self.elastic_service.search(
            query={
                "multi_match": {
                    "query": term,
                    "fields": ["patient.full_name", "assigned_to.full_name"],
                }
            },
            size=size,
        )
        hits = search_result["hits"]["hits"]
        result = list(
            map(
                lambda x: AppointmentSchema(**x["_source"]),
                hits,
            )
        )
        return result

    def autocomplete_search(self, term: str, size: int = 5) -> list[AppointmentSchema]:
        autocomplete_fields = [
            "patient.full_name",
            "assigned_to.full_name",
        ]
        search_result = self.elastic_service.search(
            query={
                "multi_match": {
                    "query": term,
                    "type": "bool_prefix",
                    "fields": autocomplete_fields,
                },
            },
            size=size,
        )

        all_sources = []
        suggestions = search_result.body["hits"]["hits"]
        for sugg in suggestions:
            all_sources.append(sugg["_source"])

        result = list(map(lambda x: AppointmentSchema(**x), all_sources))
        result_drop_duplicates = list({v.id: v for v in result}.values())
        return result_drop_duplicates

    def recreate_index(self) -> None:
        """
        This method is used to recreate the index from the database.
        TODO: Parrallelize this method with celery.

        Beginning of celery task, create lock
        Create array of chunks
        Each chunk triggers a celery task to index the chunk
        End of all tasks, trigger index refresh and removes lock

        """
        queryset = AppointmentModel.objects.all()
        docs: list[AppointmentSchema] = []
        chunk_size = 2500
        with ElasticMigration(self.elastic_service):
            for apt in queryset:
                p = self.get(id=apt.id)
                docs.append(p)
                if len(docs) == chunk_size:
                    self.elastic_service.bulk_add_docs(docs)
                    docs = []

    def update_index_by_patient_id(self, patient_id: int) -> None:
        queryset = AppointmentModel.objects.filter(patient_id=patient_id)
        for apt in queryset:
            p = self.get(id=apt.id)
            self.elastic_service.update(id=apt.id, doc_data=p)
