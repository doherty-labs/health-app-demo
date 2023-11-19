import { useEffect, useMemo, useState } from "react";
import { components } from "../../schemas/api-types";
import axios, { AxiosResponse, CanceledError } from "axios";
import { useSearchLoading } from "../../state/search";
type StaffApiType = components["schemas"]["StaffMember"];

export interface SearchUserProps {
  term: string;
}

async function handleSearch<Type>(search: string, abort: AbortController) {
  let url = "/api/staff/search?name=" + search;
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

export function useSearchUser({ term }: SearchUserProps) {
  const [staffMembers, setStaffMembers] = useState<StaffApiType[]>([]);
  const { actions } = useSearchLoading();

  useEffect(() => {
    if (term) {
      const controller = new AbortController();
      actions.setLoading(true);
      const req = async () => {
        const result = await handleSearch<StaffApiType[]>(term, controller);
        if (result) {
          setStaffMembers(result);
          actions.setLoading(false);
        }
      };
      req();
      return () => {
        actions.setLoading(false);
        controller.abort();
      };
    }
  }, [term, actions]);

  return useMemo(() => {
    return {
      staffMembers,
    };
  }, [staffMembers]);
}
