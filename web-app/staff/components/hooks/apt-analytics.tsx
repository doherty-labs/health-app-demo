import { useEffect, useMemo, useState } from "react";
import { components } from "../../schemas/api-types";
import axios, { CanceledError } from "axios";

type AppointmentAnalytics = components["schemas"]["AppointmentAnalyticsSchema"];

interface AppointmentAnalyticsProps {
  start_date: string;
  end_date: string;
  interval: string;
  initialData?: AppointmentAnalytics;
}

interface FetchAnalyticsProps {
  start_date: string;
  end_date: string;
  interval: string;
  abort: AbortController;
}

export function useAppointmentAnalytics({
  start_date,
  end_date,
  interval,
  initialData,
}: AppointmentAnalyticsProps) {
  const [data, setData] = useState<AppointmentAnalytics | undefined>(
    initialData,
  );

  const fetchData = async ({
    start_date,
    end_date,
    interval,
    abort,
  }: FetchAnalyticsProps) => {
    let url = `/api/analytics/appointment/${start_date}/${end_date}/${interval}/fetch`;
    const { data } = await axios.get<AppointmentAnalytics>(url, {
      signal: abort ? abort.signal : undefined,
    });
    return data;
  };

  useEffect(() => {
    const abort = new AbortController();

    const req = async () => {
      try {
        const data = await fetchData({
          start_date,
          end_date,
          interval,
          abort,
        });
        setData(data);
      } catch (e) {
        if (e instanceof CanceledError) {
          return;
        }
      }
    };
    req();
    return () => {
      abort.abort();
    };
  }, [start_date, end_date, interval]);

  return useMemo(() => {
    return {
      data,
    };
  }, [data]);
}
