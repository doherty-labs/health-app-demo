import { useEffect, useState } from "react";
import axios, { AxiosResponse, CanceledError } from "axios";
import { useSearchbarLoading } from "../state/loading";

interface SearchPracticeProps {
  search: string | undefined;
}

async function handleSearch<Type>(search: string, abort: AbortController) {
  let url = "/api/practice/autocomplete?name=" + search;
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

export function useSearchPractice<Type>({ search }: SearchPracticeProps) {
  const [suggestions, setSuggestions] = useState<Type>();
  const { setLoading } = useSearchbarLoading();
  useEffect(() => {
    if (search) {
      setLoading(true);
      const controller = new AbortController();
      const req = async () => {
        const result = await handleSearch<Type>(search, controller);
        if (result) setLoading(false);
        setSuggestions(result);
      };
      req();
      return () => {
        controller.abort();
      };
    } else {
      setSuggestions(undefined);
    }
  }, [search, setLoading]);

  return {
    suggestions,
  };
}
