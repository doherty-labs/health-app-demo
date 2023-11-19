import { create } from "zustand";
import { components } from "../schemas/api-types";
type StatesType = components["schemas"]["States"]["states"][0];
interface LoadingState {
  loading: boolean;
  activeNetworkRequests: number;
  setLoading: (val: boolean) => void;
}

interface SwimLaneLoadingState {
  state: StatesType;
  loading: boolean;
}

interface SwimLaneLoadingActions {
  setLoading: (val: boolean, state: StatesType) => void;
  setStates: (states: StatesType[]) => void;
}

interface KanbanLoadingState {
  states: SwimLaneLoadingState[];
  actions: SwimLaneLoadingActions;
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

export const useKanbanLoading = create<KanbanLoadingState>((set) => ({
  states: [],
  actions: {
    setLoading: (val: boolean, state: StatesType) =>
      set((s) => {
        const newState = s.states.filter((s) => s.state !== state);
        newState.push({ state, loading: val });
        return {
          states: newState,
        };
      }),
    setStates: (states: StatesType[]) =>
      set((s) => {
        const newState = states.map((state) => ({
          state,
          loading: false,
        }));
        return {
          states: newState,
        };
      }),
  },
}));
