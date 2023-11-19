import { create } from "zustand";

interface LoadingStateActions {
  setLoading: (loading: boolean) => void;
}

interface LoadingState {
  loading: boolean;
  actions: LoadingStateActions;
}

export const useSearchLoading = create<LoadingState>((set) => ({
  loading: false,
  actions: {
    setLoading: (loading) => set({ loading }),
  },
}));
