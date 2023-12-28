from django.db import transaction
from django.db.transaction import atomic
from injector import inject

from rest_api.models.appointment import AvailableAppointmentModel
from rest_api.repositories.common import CommonModelRepo
from rest_api.repositories.staff import StaffRepo
from rest_api.schemas.availability import AvailableAppointmentSchema, TeamMemberSchema
from rest_api.services.elastic_indexes.availability import AvailabilityIndex
from rest_api.services.websocket import WebsocketEventTypes, WebsocketService
from rest_api.utils.elastic_migration import ElasticMigration


class AvailabilityRepo(CommonModelRepo[AvailableAppointmentSchema]):

    elastic_service: AvailabilityIndex
    staff_repo: StaffRepo
    websocket_service: WebsocketService

    @inject
    def __init__(
        self,
        elastic_service: AvailabilityIndex,
        staff_repo: StaffRepo,
        websocket_service: WebsocketService,
    ):
        super(AvailabilityRepo, self).__init__(es_instance=elastic_service)
        self.elastic_service = elastic_service
        self.staff_repo = staff_repo
        self.websocket_service = websocket_service

    def get(self, id: int) -> AvailableAppointmentSchema:
        avail = AvailableAppointmentModel.objects.get(id=id)
        return AvailableAppointmentSchema(
            id=avail.id,
            staff_id=avail.staff.id,
            practice_id=avail.practice.id,
            team_member_id=avail.team_member.id,
            start_time=avail.start_time,
            end_time=avail.end_time,
            schedule_release_time=avail.schedule_release_time,
            team_member=TeamMemberSchema(
                id=avail.team_member.id,
                first_name=avail.team_member.first_name,
                last_name=avail.team_member.last_name,
                job_title=avail.team_member.job_title,
                bio=avail.team_member.bio,
                created_at=avail.team_member.created_at,
                updated_at=avail.team_member.updated_at,
            ),
            created_at=avail.created_at,
            updated_at=avail.updated_at,
        )

    @atomic
    def create(self, data: AvailableAppointmentSchema) -> AvailableAppointmentSchema:
        avail = AvailableAppointmentModel.objects.create(
            practice_id=data.practice_id,
            staff_id=data.staff_id,
            team_member_id=data.team_member_id,
            start_time=data.start_time,
            end_time=data.end_time,
            schedule_release_time=data.schedule_release_time,
        )
        result = self.get(id=avail.id)
        transaction.on_commit(
            lambda: self.elastic_service.add(id=avail.id, doc_data=result)
        )

        transaction.on_commit(
            lambda: self.websocket_service.send_message(
                practice_id=data.practice_id,
                message=result,
                type_event=WebsocketEventTypes.UPDATE_AVAILABILITY,
            )
        )

        return result

    @atomic
    def update(
        self, id: int, data: AvailableAppointmentSchema
    ) -> AvailableAppointmentSchema:
        avail = AvailableAppointmentModel.objects.get(id=id)
        avail.practice.id = data.practice_id
        avail.staff.id = data.staff_id
        avail.team_member.id = data.team_member_id
        avail.start_time = data.start_time
        avail.end_time = data.end_time
        avail.schedule_release_time = data.schedule_release_time
        avail.save()
        result = self.get(id=id)

        transaction.on_commit(
            lambda: self.elastic_service.update(id=id, doc_data=result)
        )
        transaction.on_commit(
            lambda: self.websocket_service.send_message(
                practice_id=data.practice_id,
                message=result,
                type_event=WebsocketEventTypes.UPDATE_AVAILABILITY,
            )
        )

        return result

    @atomic
    def delete(self, id: int) -> None:
        result = self.get(id=id)
        avail = AvailableAppointmentModel.objects.get(id=id)
        avail.delete()
        transaction.on_commit(lambda: self.elastic_service.remove(id=id))
        transaction.on_commit(
            lambda: self.websocket_service.send_message(
                practice_id=id,
                message=result,
                type_event=WebsocketEventTypes.UPDATE_AVAILABILITY,
            )
        )
        return None

    def recreate_index(self) -> None:
        queryset = AvailableAppointmentModel.objects.all()
        docs: list[AvailableAppointmentSchema] = []
        chunk_size = 2500
        with ElasticMigration(self.elastic_service):
            for avail in queryset:
                result = self.get(id=avail.id)
                docs.append(result)
                if len(docs) == chunk_size:
                    self.elastic_service.bulk_add_docs(docs)
                    docs = []

    def search(
        self,
        practice_id: int,
        team_member_id: int | None,
        from_date: str | None,
        to_date: str | None,
        size: int,
    ) -> list[AvailableAppointmentSchema]:
        if size > 50:
            size = 50

        must: list[dict] = []
        if practice_id:
            must.append({"match": {"practice_id": practice_id}})
        if team_member_id:
            must.append({"match": {"team_member_id": team_member_id}})
        if from_date and to_date:
            must.append({"range": {"start_time": {"gte": from_date, "lte": to_date}}})

        search_result = self.elastic_service.search(
            query={"bool": {"must": must}},
            size=size,
        )
        hits = search_result["hits"]["hits"]
        result = list(
            map(
                lambda x: AvailableAppointmentSchema(**x["_source"]),
                hits,
            )
        )
        return result
