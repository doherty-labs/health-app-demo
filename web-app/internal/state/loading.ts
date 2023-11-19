import { create } from "zustand";

interface LoadingState {
  loading: boolean;
  activeNetworkRequests: number;
  setLoading: (val: boolean) => void;
}

export const useLoading = create<LoadingState>((set) => ({
  loading: false,
  activeNetworkRequests: 0,
  setLoading: (val: boolean) =>
    set((s) => {
      let activeNetworkRequests = s.activeNetworkRequests;
      if (val) {
        activeNetworkRequests = s.activeNetworkRequests++;
      } else {
        activeNetworkRequests = s.activeNetworkRequests--;
      }

      return {
        loading: s.activeNetworkRequests > 0,
        activeNetworkRequests,
      };
    }),
}));

export const useRouteChangeLoading = create<LoadingState>((set) => ({
  loading: false,
  activeNetworkRequests: 0,
  setLoading: (val: boolean) =>
    set((s) => {
      let activeNetworkRequests = s.activeNetworkRequests;
      if (val) {
        activeNetworkRequests = s.activeNetworkRequests++;
      } else {
        activeNetworkRequests = s.activeNetworkRequests--;
      }

      return {
        loading: s.activeNetworkRequests > 0,
        activeNetworkRequests,
      };
    }),
}));

export const useSearchbarLoading = create<
  Omit<LoadingState, "activeNetworkRequests">
>((set) => ({
  loading: false,
  setLoading: (val: boolean) =>
    set((s) => {
      return {
        loading: val,
      };
    }),
}));
