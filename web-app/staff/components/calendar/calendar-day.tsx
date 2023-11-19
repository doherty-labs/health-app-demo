import { Fragment, useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import { CalendarDayProps, EventProps } from "./interfaces";
import moment from "moment";
import React from "react";
import { useCalendarDateState } from "./context";

interface DayProps {
  date: string;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  isSelected?: boolean;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CalendarDayView({
  events,
  onChangePeriodicity,
  onEventClick,
  onEventCreateClick,
}: CalendarDayProps) {
  const container = useRef(null);
  const containerNav = useRef(null);
  const containerOffset = useRef(null);

  const [eventsState, setEventsState] = useState<EventProps[]>(events);
  const [currMonthPage, setCurrMonthPage] = useState<DayProps[]>([]);
  const [currWeekPage, setCurrWeekPage] = useState<DayProps[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([
    "12AM",
    "1AM",
    "2AM",
    "3AM",
    "4AM",
    "5AM",
    "6AM",
    "7AM",
    "8AM",
    "9AM",
    "10AM",
    "11AM",
    "12PM",
    "1PM",
    "2PM",
    "3PM",
    "4PM",
    "5PM",
    "6PM",
    "7PM",
    "8PM",
    "9PM",
    "10PM",
    "11PM",
  ]);
  const { currentDate, actions } = useCalendarDateState();

  useEffect(() => {
    const startOfMonth = moment(currentDate).startOf("month").startOf("week");
    const endOfMonth = moment(currentDate).endOf("month").endOf("week");

    const days = [];
    let day = startOfMonth;

    while (day <= endOfMonth) {
      days.push({
        date: day.toDate().toISOString(),
        isCurrentMonth: day.month() === moment(currentDate).month(),
        isToday: day.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD"),
        isSelected:
          day.format("YYYY-MM-DD") === moment(currentDate).format("YYYY-MM-DD"),
      });
      day = day.clone().add(1, "d");
    }
    setCurrMonthPage(days);
  }, [currentDate]);

  useEffect(() => {
    const startOfWeek = moment(currentDate).startOf("week");
    const endOfWeek = moment(currentDate).endOf("week");

    const days = [];
    let day = startOfWeek;

    while (day <= endOfWeek) {
      days.push({
        date: day.toDate().toISOString(),
        isCurrentMonth: day.month() === moment(currentDate).month(),
        isToday: day.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD"),
        isSelected:
          day.format("YYYY-MM-DD") === moment(currentDate).format("YYYY-MM-DD"),
      });
      day = day.clone().add(1, "d");
    }
    setCurrWeekPage(days);
  }, [currentDate]);

  useEffect(() => {
    setEventsState(events);
  }, [events]);

  const prevDay = () => {
    const newDate = moment(currentDate).subtract(1, "day").toDate();
    actions.setDate(newDate);
  };

  const nextDay = () => {
    const newDate = moment(currentDate).add(1, "day").toDate();
    actions.setDate(newDate);
  };

  const prevMonth = () => {
    const newDate = moment(currentDate).subtract(1, "month").toDate();
    actions.setDate(newDate);
  };

  const nextMonth = () => {
    const newDate = moment(currentDate).add(1, "month").toDate();
    actions.setDate(newDate);
  };

  const todayClick = () => {
    actions.setDate(new Date());
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            <time dateTime="2022-01-22" className="sm:hidden">
              {moment(currentDate).format("MMM Do YYYY")}
            </time>
            <time dateTime="2022-01-22" className="hidden sm:inline">
              {moment(currentDate).format("Do MMMM, YYYY")}
            </time>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {moment(currentDate).format("dddd")}
          </p>
        </div>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              type="button"
              onClick={prevDay}
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Previous day</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={todayClick}
              type="button"
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              onClick={nextDay}
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Next day</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <Menu.Button
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Day view
                <ChevronDownIcon
                  className="-mr-1 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onChangePeriodicity("weekly")}
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm w-full text-left",
                          )}
                        >
                          Week view
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onChangePeriodicity("monthly")}
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm w-full text-left",
                          )}
                        >
                          Month view
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <div className="ml-6 h-6 w-px bg-gray-300" />
            <button
              onClick={onEventCreateClick}
              type="button"
              className="ml-6 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Add Availability
            </button>
          </div>
          <Menu as="div" className="relative ml-6 md:hidden">
            <Menu.Button className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">Open menu</span>
              <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onEventCreateClick}
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm w-full text-left",
                        )}
                      >
                        Add Availability
                      </button>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={todayClick}
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm w-full text-left",
                        )}
                      >
                        Go to today
                      </button>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onChangePeriodicity("weekly")}
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm w-full text-left",
                        )}
                      >
                        Week view
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onChangePeriodicity("monthly")}
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm w-full text-left",
                        )}
                      >
                        Month view
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>
      <div className="isolate flex flex-auto overflow-hidden bg-white">
        <div ref={container} className="flex flex-auto flex-col overflow-auto">
          <div
            ref={containerNav}
            className="sticky top-0 z-10 grid flex-none grid-cols-7 bg-white text-xs text-gray-500 shadow ring-1 ring-black ring-opacity-5 md:hidden"
          >
            {currWeekPage.map((day) => {
              return (
                <button
                  key={day.date}
                  type="button"
                  className="flex flex-col items-center pb-1.5 pt-3"
                >
                  <span>{moment(day.date).format("dd")}</span>
                  <span
                    className={classNames(
                      "mt-3 flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-gray-900",
                      !day.isSelected && day.isToday ? "text-blue-600" : "",
                      day.isSelected && day.isToday
                        ? "bg-blue-600 text-white"
                        : "",
                      day.isSelected && !day.isToday
                        ? "bg-gray-900 text-white"
                        : "",
                    )}
                  >
                    {moment(day.date).format("D")}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex w-full flex-auto">
            <div className="w-14 flex-none bg-white ring-1 ring-gray-100" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                style={{ gridTemplateRows: "repeat(48, minmax(3.5rem, 1fr))" }}
              >
                <div ref={containerOffset} className="row-end-1 h-7"></div>
                {timeSlots.map((timeSlot) => {
                  return (
                    <React.Fragment key={timeSlot}>
                      <div>
                        <div className="sticky left-0 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                          {timeSlot}
                        </div>
                      </div>
                      <div />
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Events */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1"
                style={{
                  gridTemplateRows: "1.75rem repeat(288, minmax(0, 1fr)) auto",
                }}
              >
                {eventsState.map((event) => {
                  const timeAmountMins =
                    Number(moment(event.start).format("HH")) * 12 + 2;
                  const mins =
                    (Number(moment(event.start).format("mm")) / 60) * 12;
                  const gridPos = timeAmountMins + mins;
                  const diffDuration =
                    (moment(event.end).diff(moment(event.start), "minutes") /
                      60) *
                    12;
                  const gridMapping = `${Math.floor(
                    gridPos,
                  )} / span ${Math.floor(diffDuration)}`;

                  const isSameDay =
                    moment(currentDate).format("YYYY-MM-DD") ===
                    moment(event.start).format("YYYY-MM-DD");

                  if (!isSameDay) {
                    return <div key={event.id}></div>;
                  }

                  return (
                    <li
                      className="relative mt-px flex"
                      key={event.id}
                      style={{ gridRow: gridMapping, cursor: "pointer" }}
                      onClick={() => onEventClick(event)}
                    >
                      {event.bookings && event.bookings.length > 0 ? (
                        <button className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-green-50 p-2 text-xs leading-5 hover:bg-green-100">
                          <p className="order-1 font-semibold text-green-700">
                            {event.title}
                          </p>
                          <p className="text-green-500 group-hover:text-green-700">
                            <time dateTime={event.start.toISOString()}>
                              {moment(event.start).format("h:mm A")}
                            </time>
                          </p>
                        </button>
                      ) : (
                        <button className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-blue-50 p-2 text-xs leading-5 hover:bg-blue-100">
                          <p className="order-1 font-semibold text-blue-700">
                            {event.title}
                          </p>
                          <p className="text-blue-500 group-hover:text-blue-700">
                            <time dateTime={event.start.toISOString()}>
                              {moment(event.start).format("h:mm A")}
                            </time>
                          </p>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
        <div className="hidden w-1/2 max-w-md flex-none border-l border-gray-100 px-8 py-10 md:block">
          <div className="flex items-center text-center text-gray-900">
            <button
              onClick={prevMonth}
              type="button"
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex-auto text-sm font-semibold">
              {moment(currentDate).format("MMMM, YYYY")}
            </div>
            <button
              onClick={nextMonth}
              type="button"
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 text-center text-xs leading-6 text-gray-500">
            <div>S</div>
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
          </div>
          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
            {currMonthPage.map((day, dayIdx) => (
              <button
                key={day.date}
                type="button"
                onClick={() => actions.setDate(new Date(day.date))}
                className={classNames(
                  "py-1.5 hover:bg-gray-100 focus:z-10",
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                  day.isSelected || day.isToday ? "font-semibold" : "",
                  day.isSelected ? "text-white" : "",
                  !day.isSelected && day.isCurrentMonth && !day.isToday
                    ? "text-gray-900"
                    : "",
                  !day.isSelected && !day.isCurrentMonth && !day.isToday
                    ? "text-gray-400"
                    : "",
                  day.isToday && !day.isSelected ? "text-blue-600" : "",
                  dayIdx === 0 ? "rounded-tl-lg" : "",
                  dayIdx === 6 ? "rounded-tr-lg" : "",
                  dayIdx === currMonthPage.length - 7 ? "rounded-bl-lg" : "",
                  dayIdx === currMonthPage.length - 1 ? "rounded-br-lg" : "",
                )}
              >
                <time
                  dateTime={day.date}
                  className={classNames(
                    "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                    day.isSelected && day.isToday ? "bg-blue-600" : "",
                    day.isSelected && !day.isToday ? "bg-gray-900" : "",
                  )}
                >
                  {moment(day.date).format("D")}
                </time>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
