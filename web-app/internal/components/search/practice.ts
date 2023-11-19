import axios, { AxiosResponse, CanceledError } from "axios";
import { useSearchbarLoading } from "../../state/loading";
import { useEffect, useMemo, useState } from "react";
import { useTableState } from "../../state/table";

interface HookProps<Type> {
  searchString: string | undefined;
  initialAllResults: Type;
  pageNumber: number;
}

async function handleSearch<Type>(
  search: string,
  abort: AbortController,
  pageNumber: number,
  sort?: { id: string; direction: "asc" | "desc" | "none" }[]
) {
  let url = "/api/practice/search?name=" + search + "&page=" + pageNumber;
  if (sort && sort.length > 0) {
    url =
      url +
      "&ordering=" +
      sort.map((s) => (s.direction === "desc" ? "-" : "") + s.id).join(",");
  }
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

async function getAll<Type>(
  abort: AbortController,
  pageNumber: number,
  sort?: { id: string; direction: "asc" | "desc" | "none" }[]
) {
  let url = "/api/practice/all" + "?page=" + pageNumber;
  if (sort && sort.length > 0) {
    url =
      url +
      "&ordering=" +
      sort.map((s) => (s.direction === "desc" ? "-" : "") + s.id).join(",");
  }
  const allPractice: Promise<AxiosResponse<Type>> = axios.get(url, {
    headers: {
      "Content-Type": "application/json",
    },
    signal: abort.signal,
  });
  try {
    const result = await allPractice;
    return result.data;
  } catch (e) {
    if (e instanceof CanceledError) {
      return undefined;
    } else {
      return undefined;
    }
  }
}

export function usePractices<Type>({
  searchString,
  initialAllResults,
  pageNumber,
}: HookProps<Type>): {
  searchResults: Type | undefined;
  allResults: Type;
  dataset: Type;
} {
  const { setLoading } = useSearchbarLoading();
  const { sort } = useTableState();
  const [searchResults, setSearchResults] = useState<Type>();
  const [allResults, setAllResults] = useState<Type>(initialAllResults);
  const [dataset, setDataset] = useState<Type>(initialAllResults);

  useEffect(() => {
    setLoading(true);
    if (searchString) {
      const controller = new AbortController();
      const req = async () => {
        const result = await handleSearch<Type>(
          searchString,
          controller,
          pageNumber,
          sort
        );
        if (result) setLoading(false);
        setSearchResults(result);
      };
      req();
      return () => {
        controller.abort();
      };
    } else {
      setSearchResults(undefined);
      setLoading(false);
    }
  }, [searchString, setLoading, pageNumber, sort]);

  useEffect(() => {
    if (initialAllResults && sort && sort.length === 0 && pageNumber === 1) {
      setAllResults(initialAllResults);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const req = async () => {
      const result = await getAll<Type>(controller, pageNumber, sort);
      if (result) {
        setLoading(false);
        setAllResults(result);
      }
    };
    req();
    return () => {
      controller.abort();
    };
  }, [initialAllResults, setLoading, pageNumber, sort]);

  useMemo(() => {
    if (searchResults) {
      setDataset(searchResults);
    } else {
      setDataset(allResults);
    }
  }, [searchResults, allResults]);

  return {
    searchResults,
    allResults,
    dataset,
  };
}
