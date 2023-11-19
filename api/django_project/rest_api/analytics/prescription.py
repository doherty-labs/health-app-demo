from dateutil import parser
from injector import inject

from rest_api.analytics.schema import (
    GroupByPoint,
    PrescriptionAnalyticsSchema,
    TimeSeriesPoint,
)
from rest_api.services.elastic_indexes.prescription import PrescriptionIndex


class PrescriptionAnalytics:
    @inject
    def __init__(self, elastic_service: PrescriptionIndex):
        self.elastic_service = elastic_service

    def get_prescription_count(
        self,
        practice_id: str,
        start_date: str | None = None,
        end_date: str | None = None,
        interval: str = "day",
    ) -> list[TimeSeriesPoint]:
        result_q = self.elastic_service.search(
            query={
                "bool": {
                    "must": [
                        {"range": {"created_at": {"gte": start_date, "lte": end_date}}},
                        {"term": {"practice_id": practice_id}},
                    ]
                }
            },
            aggs={
                "by_freq": {
                    "date_histogram": {
                        "field": "created_at",
                        "calendar_interval": interval,
                        "min_doc_count": 0,
                        "extended_bounds": {"min": start_date, "max": end_date},
                    },
                    "aggs": {"item_count": {"value_count": {"field": "id"}}},
                }
            },
        )
        result_m = result_q["aggregations"]["by_freq"]["buckets"]
        result: list[TimeSeriesPoint] = []

        for item in result_m:
            current_date_string = item["key_as_string"]
            current_date = parser.parse(current_date_string)
            current_val = int(item["item_count"]["value"])
            result.append(TimeSeriesPoint(date=current_date, value=current_val))

        return result

    def get_prescription_by_state(
        self,
        practice_id: str,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> list[GroupByPoint]:
        result_q = self.elastic_service.search(
            query={
                "bool": {
                    "must": [
                        {"range": {"created_at": {"gte": start_date, "lte": end_date}}},
                        {"term": {"practice_id": practice_id}},
                    ]
                }
            },
            aggs={"by_states": {"terms": {"field": "state"}}},
        )
        result_m = result_q["aggregations"]["by_states"]["buckets"]
        result: list[GroupByPoint] = []

        for item in result_m:
            current_state = item["key"]
            current_val = int(item["doc_count"])
            result.append(GroupByPoint(by=current_state, value=current_val))

        return result

    def get_avg_time_in_state(
        self,
        practice_id: str,
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> list[GroupByPoint]:
        result: list[GroupByPoint] = []
        result_q = self.elastic_service.search(
            query={
                "bool": {
                    "must": [
                        {"range": {"created_at": {"gte": start_date, "lte": end_date}}},
                        {"exists": {"field": "logs.transition_delta"}},
                        {"term": {"practice_id": practice_id}},
                    ]
                }
            },
            aggs={
                "duration": {
                    "nested": {"path": "logs"},
                    "aggs": {
                        "group_by_state": {
                            "terms": {"field": "logs.to_state"},
                            "aggs": {
                                "avg_duration": {
                                    "avg": {"field": "logs.transition_delta"}
                                }
                            },
                        },
                    },
                }
            },
        )
        result_m = result_q["aggregations"]["duration"]["group_by_state"]["buckets"]
        for item in result_m:
            current_state = item["key"]
            current_val = item["avg_duration"]["value"]
            current_val = int(current_val) if current_val else 0
            result.append(GroupByPoint(by=current_state, value=current_val))

        return result

    def get_all_stats(
        self,
        practice_id: str,
        start_date: str | None = None,
        end_date: str | None = None,
        interval: str = "day",
    ) -> PrescriptionAnalyticsSchema:
        count_by_state = self.get_prescription_by_state(
            practice_id, start_date, end_date
        )
        overall_count = self.get_prescription_count(
            practice_id, start_date, end_date, interval
        )
        avg_time_in_state = self.get_avg_time_in_state(
            practice_id, start_date, end_date
        )
        return PrescriptionAnalyticsSchema(
            count_by_state=count_by_state,
            overall_count=overall_count,
            avg_time_in_state=avg_time_in_state,
        )
