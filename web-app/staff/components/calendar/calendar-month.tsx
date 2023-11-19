import { Fragment, useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import moment from "moment";
import { CalendarMonthlyProps, EventProps } from "./interfaces";
import { useCalendarDateState } from "./context";

interface DayProps {
  date: string;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  isSelected?: boolean;
  events: EventProps[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CalendarMonthlyComponent({
  events,
  onChangePeriodicity,
  onEventCreateClick,
  onEventClick,
}: CalendarMonthlyProps) {
  const [currMonthPage, setCurrMonthPage] = useState<DayProps[]>([]);
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
        events: events.filter(
          (event) =>
            moment(event.start).format("YYYY-MM-DD") ===
            day.format("YYYY-MM-DD"),
        ),
      });
      day = day.clone().add(1, "d");
    }
    setCurrMonthPage(days);
  }, [currentDate, events]);

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
    <div className="lg:flex lg:h-full lg:flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time dateTime={moment(currentDate).format("YYYY-MM")}>
            {moment(currentDate).format("MMMM YYYY")}
          </time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Previous month</span>
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
              onClick={nextMonth}
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <Menu.Button
                type="button"
                className="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Month view
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
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>
      <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">un</span>
          </div>
          <div className="bg-white py-2">
            M<span className="sr-only sm:not-sr-only">on</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">ue</span>
          </div>
          <div className="bg-white py-2">
            W<span className="sr-only sm:not-sr-only">ed</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">hu</span>
          </div>
          <div className="bg-white py-2">
            F<span className="sr-only sm:not-sr-only">ri</span>
          </div>
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">at</span>
          </div>
        </div>
        <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
          <div
            className={`hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-${Math.floor(
              currMonthPage.length / 7,
            )} lg:gap-px`}
          >
            {currMonthPage.map((day) => (
              <div
                key={day.date}
                className={classNames(
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-500",
                  "relative px-3 py-2 cursor-pointer hover:bg-gray-100 focus:z-10",
                )}
                onClick={() => {
                  actions.setDate(new Date(day.date));
                  actions.setCalendarView("daily");
                }}
              >
                <time
                  dateTime={day.date}
                  className={classNames(
                    "flex h-6 w-6 items-center justify-center ",
                    !day.isSelected && day.isToday
                      ? "rounded-full bg-blue-600 font-semibold text-white"
                      : "",
                    day.isSelected && day.isToday
                      ? "rounded-full bg-blue-600 font-semibold text-white"
                      : "",
                    day.isSelected && !day.isToday
                      ? "rounded-full bg-gray-900 font-semibold text-white"
                      : "",
                  )}
                >
                  {moment(day.date).format("D")}
                </time>
                {day.events.length > 0 && (
                  <ol className="mt-2">
                    {day.events.slice(0, 2).map((event) => (
                      <li key={event.id}>
                        <button
                          className="group flex"
                          onClick={() => {
                            onEventClick(event);
                          }}
                        >
                          <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-blue-600">
                            {event.title}
                          </p>
                          <time
                            dateTime={event.start.toISOString()}
                            className="ml-3 hidden flex-none text-gray-500 group-hover:text-blue-600 xl:block"
                          >
                            {moment(event.start).format("h:mm A")}
                          </time>
                        </button>
                      </li>
                    ))}
                    {day.events.length > 2 && (
                      <li className="text-gray-500">
                        + {day.events.length - 2} more
                      </li>
                    )}
                  </ol>
                )}
              </div>
            ))}
          </div>
          <div
            className={`isolate grid w-full grid-cols-7 grid-rows-${Math.floor(
              currMonthPage.length / 7,
            )} gap-px lg:hidden`}
          >
            {currMonthPage.map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  actions.setDate(new Date(day.date));
                  actions.setCalendarView("daily");
                }}
                className={classNames(
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                  day.isSelected || day.isToday ? "font-semibold" : "",
                  day.isSelected ? "text-white" : "",
                  !day.isSelected && day.isToday ? "text-blue-600" : "",
                  !day.isSelected && day.isCurrentMonth && !day.isToday
                    ? "text-gray-900"
                    : "",
                  !day.isSelected && !day.isCurrentMonth && !day.isToday
                    ? "text-gray-500"
                    : "",
                  "flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10",
                )}
              >
                <time
                  dateTime={day.date}
                  className={classNames(
                    day.isSelected
                      ? "flex h-6 w-6 items-center justify-center rounded-full"
                      : "",
                    day.isSelected && day.isToday ? "bg-blue-600" : "",
                    day.isSelected && !day.isToday ? "bg-gray-900" : "",
                    "ml-auto",
                  )}
                >
                  {moment(day.date).format("D")}
                </time>
                <span className="sr-only">{day.events.length} events</span>
                {day.events.length > 0 && (
                  <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                    {day.events.map((event) => (
                      <span
                        key={event.id}
                        className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"
                      />
                    ))}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      {currMonthPage.find((d) => d.isSelected)?.isSelected ? (
        <div className="px-4 py-10 sm:px-6 lg:hidden">
          <ol className="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5">
            {currMonthPage
              .find((d) => d.isSelected)
              ?.events.map((event) => (
                <li
                  key={event.id}
                  className="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50"
                >
                  <div className="flex-auto">
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <time
                      dateTime={event.start.toISOString()}
                      className="mt-2 flex items-center text-gray-700"
                    >
                      <ClockIcon
                        className="mr-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      {moment(event.start).format("h:mm A")}
                    </time>
                  </div>
                  <button
                    onClick={() => {
                      onEventClick(event);
                    }}
                    className="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400"
                  >
                    Edit<span className="sr-only">, {event.title}</span>
                  </button>
                </li>
              ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
