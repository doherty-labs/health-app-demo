import { create } from "zustand";
import { components } from "../schemas/api-types";
type PracticeType = components["schemas"]["Practice"];

interface UserStatePropsActions {
  setPractice: (practice: PracticeType) => void;
}

interface UserStateProps {
  practice: PracticeType | null;
  actions: UserStatePropsActions;
}

export const useUserProps = create<UserStateProps>((set) => ({
  practice: null,
  actions: {
    setPractice: (practice: PracticeType) => {
      set(() => {
        return {
          practice: practice,
        };
      });
    },
  },
}));
