import { useEffect, useMemo, useState } from "react";
import { components } from "../../schemas/api-types";
import axios, { CanceledError } from "axios";

type PrescriptionAnalytics =
  components["schemas"]["PrescriptionAnalyticsSchema"];

interface PrescriptionAnalyticsProps {
  start_date: string;
  end_date: string;
  interval: string;
  initialData?: PrescriptionAnalytics;
}

interface FetchAnalyticsProps {
  start_date: string;
  end_date: string;
  interval: string;
  abort: AbortController;
}

export function usePrescriptionAnalytics({
  start_date,
  end_date,
  interval,
  initialData,
}: PrescriptionAnalyticsProps) {
  const [data, setData] = useState<PrescriptionAnalytics | undefined>(
    initialData,
  );

  const fetchData = async ({
    start_date,
    end_date,
    interval,
    abort,
  }: FetchAnalyticsProps) => {
    let url = `/api/analytics/prescription/${start_date}/${end_date}/${interval}/fetch`;
    const { data } = await axios.get<PrescriptionAnalytics>(url, {
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
