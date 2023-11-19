import { create } from "zustand";

interface LoadingState {
  loading: boolean;
  activeNetworkRequests: number;
  setLoading: (val: boolean) => void;
}

interface FileLoadingStatActions {
  setCompleted: (val: boolean) => void;
  setLoading: (val: boolean) => void;
  setProgress: (val: number) => void;
}

interface FileLoadingState {
  loading: boolean;
  completed: boolean;
  progress: number;
  actions: FileLoadingStatActions;
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

export const useFileProgressPatientId = create<FileLoadingState>((set) => ({
  loading: false,
  completed: false,
  progress: 0,
  actions: {
    setProgress: (val: number) =>
      set((s) => {
        return {
          progress: val,
        };
      }),
    setLoading: (val: boolean) =>
      set((s) => {
        return {
          loading: val,
        };
      }),
    setCompleted: (val: boolean) =>
      set((s) => {
        return {
          completed: val,
        };
      }),
  },
}));

export const useFileProgressPatientPoa = create<FileLoadingState>((set) => ({
  loading: false,
  completed: false,
  progress: 0,
  actions: {
    setProgress: (val: number) =>
      set((s) => {
        return {
          progress: val,
        };
      }),
    setLoading: (val: boolean) =>
      set((s) => {
        return {
          loading: val,
        };
      }),
    setCompleted: (val: boolean) =>
      set((s) => {
        return {
          completed: val,
        };
      }),
  },
}));
