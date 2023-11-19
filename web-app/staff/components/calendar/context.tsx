import { create } from "zustand";

interface CalendarActions {
  setDate: (d: Date) => void;
  setCalendarView: (view: "monthly" | "daily" | "weekly") => void;
}

interface CalendarState {
  currentDate: Date;
  calendarView: "monthly" | "daily" | "weekly";
  actions: CalendarActions;
}

export const useCalendarDateState = create<CalendarState>((set) => ({
  currentDate: new Date(),
  calendarView: "weekly",
  actions: {
    setDate: (val: Date) =>
      set((s) => {
        return {
          currentDate: val,
        };
      }),
    setCalendarView: (val: "monthly" | "daily" | "weekly") =>
      set((s) => {
        return {
          calendarView: val,
        };
      }),
  },
}));
