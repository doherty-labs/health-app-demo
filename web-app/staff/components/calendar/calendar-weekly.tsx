import { Fragment, useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import { Flex } from "@chakra-ui/react";
import moment from "moment";
import { CalendarWeeklyProps, EventProps } from "./interfaces";
import React from "react";
import { useCalendarDateState } from "./context";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CalendarWeeklyComponent({
  events,
  onChangePeriodicity,
  onEventClick,
  onEventCreateClick,
}: CalendarWeeklyProps) {
  const container = useRef<HTMLDivElement>(null);
  const containerNav = useRef<HTMLDivElement>(null);
  const containerOffset = useRef<HTMLDivElement>(null);
  const { currentDate, actions } = useCalendarDateState();
  const [eventsState, setEventsState] = useState<EventProps[]>(events);
  const [currWeek, setCurrWeek] = useState<Date[]>([]);
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

  useEffect(() => {
    const startOfWeek = moment(currentDate).startOf("week");
    const endOfWeek = moment(currentDate).endOf("week");

    const days = [];
    let day = startOfWeek;

    while (day <= endOfWeek) {
      days.push(day.toDate());
      day = day.clone().add(1, "d");
    }
    setCurrWeek(days);
  }, [currentDate]);

  useEffect(() => {
    setEventsState(events);
  }, [events]);

  const prevWeek = () => {
    const newDate = moment(currentDate).subtract(1, "week").toDate();
    actions.setDate(newDate);
  };

  const nextWeek = () => {
    const newDate = moment(currentDate).add(1, "week").toDate();
    actions.setDate(newDate);
  };

  const todayClick = () => {
    actions.setDate(new Date());
  };

  const addAvailability = () => {
    onEventCreateClick();
  };

  return (
    <Flex direction={"column"} w={"100%"}>
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time dateTime={moment(currentDate).format("YYYY-MM")}>
            {moment(currentDate).format("MMMM YYYY")}
          </time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              type="button"
              onClick={prevWeek}
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Previous week</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={todayClick}
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              type="button"
              onClick={nextWeek}
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Next week</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <Menu.Button
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Week view
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
                          onClick={() => onChangePeriodicity("daily")}
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm w-full text-left",
                          )}
                        >
                          Day view
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
              type="button"
              onClick={addAvailability}
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
                        onClick={addAvailability}
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm w-full text-left",
                        )}
                      >
                        Create availability
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
                          "block px-4 py-2 text-sm w-full text-left w-full text-left",
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
                        onClick={() => onChangePeriodicity("daily")}
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm w-full text-left",
                        )}
                      >
                        Day view
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
      <div
        ref={container}
        className="isolate flex flex-auto flex-col overflow-auto bg-white"
      >
        <div
          style={{ width: "165%" }}
          className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full"
        >
          <div
            ref={containerNav}
            className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8"
          >
            <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
              {
                // Mobile days
                currWeek.map((day) => {
                  const isSelected =
                    moment(day).format("YYYY-MM-DD") ===
                    moment(currentDate).format("YYYY-MM-DD");

                  const isToday =
                    moment(day).format("YYYY-MM-DD") ===
                    moment().format("YYYY-MM-DD");
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      className="flex flex-col items-center pb-3 pt-2 cursor-pointer"
                      onClick={() => actions.setDate(day)}
                    >
                      {moment(day).format("ddd")}{" "}
                      <span
                        className={classNames(
                          "mt-1 flex h-8 w-8 items-center justify-center  text-base font-semibold text-gray-900",
                          !isSelected && isToday
                            ? "rounded-full bg-blue-600 text-white"
                            : "",
                          isSelected && isToday
                            ? "rounded-full bg-blue-600 text-white"
                            : "",
                          isSelected && !isToday
                            ? "rounded-full bg-gray-900 text-white"
                            : "",
                        )}
                      >
                        {moment(day).format("D")}
                      </span>
                    </button>
                  );
                })
              }
            </div>

            <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
              <div className="col-end-1 w-14" />
              {
                // Desktop days
                currWeek.map((day) => {
                  const isSelected =
                    moment(day).format("YYYY-MM-DD") ===
                    moment(currentDate).format("YYYY-MM-DD");

                  const isToday =
                    moment(day).format("YYYY-MM-DD") ===
                    moment().format("YYYY-MM-DD");

                  return (
                    <div
                      key={day.toISOString()}
                      className="flex items-center justify-center py-3 cursor-pointer"
                      onClick={() => actions.setDate(day)}
                    >
                      <span className={"flex items-baseline"}>
                        {moment(day).format("ddd")}{" "}
                        <span
                          className={classNames(
                            "m-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900",
                            !isSelected && isToday
                              ? "ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-semibold text-white"
                              : "",
                            isSelected && isToday
                              ? "ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-semibold text-white"
                              : "",
                            isSelected && !isToday
                              ? "ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 font-semibold text-white"
                              : "",
                          )}
                        >
                          {moment(day).format("D")}
                        </span>
                      </span>
                    </div>
                  );
                })
              }
            </div>
          </div>
          <div className="flex flex-auto">
            <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                style={{ gridTemplateRows: "repeat(48, minmax(3.5rem, 1fr))" }}
              >
                <div ref={containerOffset} className="row-end-1 h-7"></div>
                {
                  // Time slots
                  timeSlots.map((time) => (
                    <React.Fragment key={time}>
                      <div>
                        <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                          {time}
                        </div>
                      </div>
                      <div key={time + "__"} />
                    </React.Fragment>
                  ))
                }
              </div>

              {/* Vertical lines */}
              <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                <div className="col-start-1 row-span-full" />
                <div className="col-start-2 row-span-full" />
                <div className="col-start-3 row-span-full" />
                <div className="col-start-4 row-span-full" />
                <div className="col-start-5 row-span-full" />
                <div className="col-start-6 row-span-full" />
                <div className="col-start-7 row-span-full" />
                <div className="col-start-8 row-span-full w-8" />
              </div>

              {/* Events */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
                style={{
                  gridTemplateRows: "1.75rem repeat(288, minmax(0, 1fr)) auto",
                }}
              >
                {eventsState.map((event) => {
                  const dayNum = moment(event.start).day() + 1;
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

                  const currentGridDay = currWeek[dayNum - 1];
                  const isSameDay =
                    moment(currentGridDay).format("YYYY-MM-DD") ===
                    moment(event.start).format("YYYY-MM-DD");

                  if (!isSameDay) {
                    return <div key={event.id}></div>;
                  }

                  return (
                    <li
                      className={`relative mt-px flex sm:col-start-${dayNum}`}
                      style={{ gridRow: gridMapping, cursor: "pointer" }}
                      key={event.id}
                      onClick={() => onEventClick(event)}
                    >
                      {event.bookings && event.bookings.length > 0 ? (
                        <a className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-green-50 p-2 text-xs leading-5 hover:bg-green-100">
                          <p className="font-semibold text-green-700">
                            {event.title}
                          </p>
                          <p className="text-green-500 group-hover:text-green-700">
                            <time dateTime={event.start.toISOString()}>
                              {moment(event.start).format("HH:mm")}
                            </time>
                          </p>
                        </a>
                      ) : (
                        <a className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-blue-50 p-2 text-xs leading-5 hover:bg-blue-100">
                          <p className="font-semibold text-blue-700">
                            {event.title}
                          </p>
                          <p className="text-blue-500 group-hover:text-blue-700">
                            <time dateTime={event.start.toISOString()}>
                              {moment(event.start).format("HH:mm")}
                            </time>
                          </p>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Flex>
  );
}
