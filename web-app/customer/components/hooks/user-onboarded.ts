import axios, { AxiosResponse, CanceledError } from "axios";
import { components } from "../../schemas/api-types";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
type OnboardedType = components["schemas"]["Onboarded"];

async function getOnboarded<Type>(abort: AbortController) {
  let url = "/api/patient/onboarded";
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

export function useUserOnboarded() {
  const [onboarded, setOnboarded] = useState<Boolean>();
  const { push } = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const req = async () => {
      const result = await getOnboarded<OnboardedType>(controller);
      setOnboarded(result?.has_onboarded);
    };
    req();
    return () => {
      controller.abort();
    };
  }, [push]);

  return useMemo(() => {
    return { onboarded };
  }, [onboarded]);
}
