import { useCallback, useEffect, useMemo, useState } from "react";
import { EventProps } from "../calendar/interfaces";
import axios, { AxiosResponse, CanceledError } from "axios";
import { components } from "../../schemas/api-types";
import moment from "moment";
import _ from "lodash";

type AvailabilityType = components["schemas"]["Availability"];
type BookingType = components["schemas"]["Booking"];

export interface TeamAvailability {
  initialData?: EventProps[];
  startDate: Date;
  endDate: Date;
  teamId: number;
  practiceId: number;
}

interface ReqProps {
  practiceId: number;
  teamId: number;
  startDate: string;
  endDate: string;
  abort: AbortController;
}

interface AvailabilityToEventProps {
  availability: AvailabilityType[];
  bookings: BookingType[];
}

async function getAvailability({
  practiceId,
  teamId,
  startDate,
  endDate,
  abort,
}: ReqProps) {
  let url = `/api/availability/list/${practiceId}/${teamId}?start_date=${startDate}&end_date=${endDate}`;
  const searchPractice: Promise<
    AxiosResponse<{ results: AvailabilityType[] }>
  > = axios.get(url, {
    headers: {
      "Content-Type": "application/json",
    },
    signal: abort.signal,
  });
  try {
    const result = await searchPractice;
    return result.data;
  } catch (e) {
    if (e instanceof CanceledError) {
      return undefined;
    } else {
      return undefined;
    }
  }
}

async function getBookings({
  practiceId,
  teamId,
  startDate,
  endDate,
  abort,
}: ReqProps) {
  let url = `/api/booking/search?practice_id=${practiceId}&team_member_id=${teamId}&from_date=${startDate}&to_date=${endDate}`;
  const searchPractice: Promise<AxiosResponse<{ results: BookingType[] }>> =
    axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: abort.signal,
    });
  try {
    const result = await searchPractice;
    return result.data;
  } catch (e) {
    if (e instanceof CanceledError) {
      return undefined;
    } else {
      return undefined;
    }
  }
}

export function mapAvailabilityToEventProps({
  availability,
  bookings,
}: AvailabilityToEventProps): EventProps[] {
  const res = _.chain(availability)
    .map((avail) => {
      const matchingBooking = _.chain(bookings)
        .filter((booking) => {
          return avail.id === booking.available_appointment_id;
        })
        .value();

      return {
        id: avail.id?.toString() || "",
        title: `${moment(avail.start_time).format("HH:mm")} - ${moment(
          avail.end_time,
        ).format("HH:mm")}`,
        start: moment(avail.start_time).toDate(),
        end: moment(avail.end_time).toDate(),
        color: "green",
        scheduleReleaseTime: moment(avail.schedule_release_time).toDate(),
        bookings: matchingBooking,
      };
    })
    .value();
  return res;
}

export function useTeamAvailability({
  initialData,
  startDate,
  endDate,
  teamId,
  practiceId,
}: TeamAvailability) {
  const [events, setEvents] = useState<EventProps[] | undefined>(initialData);

  const manuallyRefresh = useCallback(() => {
    const controller = new AbortController();
    const req = async () => {
      const availabilityResult = await getAvailability({
        practiceId,
        teamId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        abort: controller,
      });
      const bookingResult = await getBookings({
        practiceId,
        teamId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        abort: controller,
      });

      const events = mapAvailabilityToEventProps({
        availability: availabilityResult?.results || [],
        bookings: bookingResult?.results || [],
      });
      setEvents(events);
    };
    req();
  }, [endDate, practiceId, startDate, teamId]);

  useEffect(() => {
    const controller = new AbortController();
    const req = async () => {
      const availabilityResult = await getAvailability({
        practiceId,
        teamId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        abort: controller,
      });
      const bookingResult = await getBookings({
        practiceId,
        teamId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        abort: controller,
      });

      const events = mapAvailabilityToEventProps({
        availability: availabilityResult?.results || [],
        bookings: bookingResult?.results || [],
      });
      setEvents(events);
    };
    req();
    return () => {
      controller.abort();
    };
  }, [endDate, practiceId, startDate, teamId]);

  return useMemo(() => {
    return { events, manuallyRefresh };
  }, [events, manuallyRefresh]);
}
