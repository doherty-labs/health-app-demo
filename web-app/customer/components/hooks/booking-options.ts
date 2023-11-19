import { useEffect, useMemo, useState } from "react";
import { components } from "../../schemas/api-types";
import axios, { AxiosResponse, CanceledError } from "axios";
import { useLoading } from "../state/loading";
import { usePracticeAvailabilityEvents } from "./availability-socket";

interface BookingOptions {
  practiceId: string;
  teamMemberId: string | null;
  fromDate: string | null;
  toDate: string | null;
}

type AvailabilityType = components["schemas"]["Availability"];

async function handleSearch<Type>(search: string, abort: AbortController) {
  let url = "/api/booking/options?" + search;
  const searchPractice: Promise<AxiosResponse<Type>> = axios.get(url, {
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

export function useBookingOptions({
  practiceId,
  teamMemberId,
  fromDate,
  toDate,
}: BookingOptions) {
  const [availability, setAvailability] = useState<AvailabilityType[]>([]);
  const { setLoading } = useLoading();

  usePracticeAvailabilityEvents({
    practiceId: Number(practiceId),
    updateCallback: async () => {
      const parmas = new URLSearchParams({
        practice_id: practiceId,
        team_member_id: teamMemberId || "",
        from_date: fromDate || "",
        to_date: toDate || "",
      });
      const result = await handleSearch<{ results: AvailabilityType[] }>(
        parmas.toString(),
        new AbortController(),
      );
      if (result) {
        setLoading(false);
        setAvailability(result.results);
      }
    },
  });

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const req = async () => {
      const parmas = new URLSearchParams({
        practice_id: practiceId,
        team_member_id: teamMemberId || "",
        from_date: fromDate || "",
        to_date: toDate || "",
      });
      const result = await handleSearch<{ results: AvailabilityType[] }>(
        parmas.toString(),
        controller,
      );
      if (result) {
        setLoading(false);
        setAvailability(result.results);
      }
    };
    req();
    return () => {
      controller.abort();
    };
  }, [fromDate, practiceId, setLoading, teamMemberId, toDate]);

  return useMemo(() => {
    return {
      availability,
    };
  }, [availability]);
}
