import { components } from "../../schemas/api-types";
import { AvailFormType } from "../availability/form";
type BookingType = components["schemas"]["Booking"];
export interface EventProps {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  scheduleReleaseTime: Date;
  bookings?: BookingType[];
}

export interface CalendarProps {
  events: EventProps[];
  onChangePeriodicity: (periodicity: "monthly" | "daily" | "weekly") => void;
  onEventClick: (event: EventProps) => void;
  onEventCreateClick: () => void;
}

export interface CalendarWeeklyProps extends CalendarProps {}

export interface CalendarDayProps extends CalendarProps {}

export interface CalendarMonthlyProps extends CalendarProps {}

export interface AllCalendarProps {
  events: EventProps[];
  onEventClick: (event: EventProps) => void;
  onEventCreate: (event: AvailFormType) => void;
  pageTitle: string;
}
