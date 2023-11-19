import { useMemo, useState, useEffect } from "react";
import { components } from "../../schemas/api-types";
import axios, { CanceledError } from "axios";
import { useSearchLoading } from "../../state/search";
type PatientType = components["schemas"]["Patient"];

interface SearchPatientProps {
  search: string;
}

interface PaginatedPatients {
  count: number;
  next: string;
  previous: string;
  results: PatientType[];
}

interface FetchPatientsReqProps {
  search: string;
  abort: AbortController;
}

export function useSearchPatient({ search }: SearchPatientProps) {
  const [results, setResults] = useState<PatientType[]>([]);
  const { actions } = useSearchLoading();

  const fetchPatients = async ({ search, abort }: FetchPatientsReqProps) => {
    let url = `/api/staff/patient/search?name=${search}`;
    const { data } = await axios.get<PaginatedPatients>(url, {
      signal: abort ? abort.signal : undefined,
    });
    return data;
  };

  useEffect(() => {
    const abort = new AbortController();
    actions.setLoading(true);
    const req = async () => {
      try {
        const data = await fetchPatients({
          search,
          abort,
        });
        setResults(data.results);
        actions.setLoading(false);
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
  }, [search, actions]);

  return useMemo(() => {
    return {
      results,
    };
  }, [results]);
}
