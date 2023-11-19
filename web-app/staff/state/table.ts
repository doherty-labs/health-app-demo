import { create } from "zustand";

interface TableStateProps {
  sort: { id: string; direction: "asc" | "desc" | "none" }[];
  setSort: (sort: { id: string; direction: "asc" | "desc" | "none" }[]) => void;
}

export const useTableState = create<TableStateProps>((set) => ({
  sort: [],
  setSort: (sort: { id: string; direction: "asc" | "desc" | "none" }[]) =>
    set(() => {
      return {
        sort: sort,
      };
    }),
}));
