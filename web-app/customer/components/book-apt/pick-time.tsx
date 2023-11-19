import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Divider,
  Grid,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { components } from "../../schemas/api-types";
import { useEffect, useState } from "react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import moment from "moment";
import _ from "lodash";
import { useLoading } from "../state/loading";

type AvailabilityType = components["schemas"]["Availability"];
type TeamType = components["schemas"]["Availability"]["team_member"];

interface TeamAptsProps {
  team: TeamType;
  appointments: AvailabilityType[];
}

interface DayProps {
  date: string;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  isSelected?: boolean;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
export interface BookTimeProps {
  onDateChange: (date: Date) => void;
  availability: AvailabilityType[];
  onPickTime: (availability: AvailabilityType) => void;
}

export function BookTimeComponent({
  onDateChange,
  availability,
  onPickTime,
}: BookTimeProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currMonthPage, setCurrMonthPage] = useState<DayProps[]>([]);
  const [isSelected, setIsSelected] = useState<Date>(new Date());
  const [apts, setApts] = useState<TeamAptsProps[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [clickedApt, setClickedApt] = useState<AvailabilityType>();
  const { loading } = useLoading();

  useEffect(() => {
    const results = _.chain(availability)
      .groupBy("team_member_id")
      .map((apts: AvailabilityType[]) => {
        const result: TeamAptsProps = {
          team: apts[0].team_member,
          appointments: apts,
        };
        return result;
      })
      .value();
    setApts(results);
  }, [availability]);

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
          day.format("YYYY-MM-DD") === moment(isSelected).format("YYYY-MM-DD"),
      });
      day = day.clone().add(1, "d");
    }
    setCurrMonthPage(days);
  }, [currentDate, isSelected]);

  useEffect(() => {
    onDateChange(isSelected);
  }, [isSelected, onDateChange]);

  const prevMonth = () => {
    const newDate = moment(currentDate).subtract(1, "month").toDate();
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = moment(currentDate).add(1, "month").toDate();
    setCurrentDate(newDate);
  };

  return (
    <Stack w={"100%"} divider={<Divider />}>
      <Box
        as="section"
        bg="bg.surface"
        pt={{ base: "4", md: "8" }}
        pb={{ base: "6", md: "6" }}
      >
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Booking</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text as={"b"}>
                {clickedApt?.team_member?.first_name}{" "}
                {clickedApt?.team_member?.last_name}{" "}
              </Text>
              <Text>{moment(clickedApt?.start_time).format("lll")}</Text>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  if (!clickedApt) return;
                  onPickTime(clickedApt);
                  onClose();
                }}
              >
                Confirm
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Container>
          <Breadcrumb mb={4}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Book</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                Book Appointment
              </Heading>
              <Text color="fg.muted">
                Please select a time that works for you.
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container py={4}>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
          <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
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
                  onClick={() => {
                    const d = new Date(day.date);
                    if (moment(d).isBefore(moment().startOf("day"))) return;
                    setIsSelected(d);
                  }}
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
                    moment(day.date).isBefore(moment().startOf("day"))
                      ? "opacity-50"
                      : "",
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
          <ol className="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8">
            <Skeleton isLoaded={!loading}>
              {apts.map((avail) => (
                <li
                  key={avail.team?.id}
                  className="relative flex space-x-6 py-6 xl:static"
                >
                  <Avatar
                    name={avail.team?.first_name + " " + avail.team?.last_name}
                  />
                  <div className="flex-auto">
                    <h3 className="pr-10 font-semibold text-gray-900 xl:pr-0">
                      {avail.team?.first_name} {avail.team?.last_name}
                    </h3>
                    <dl className="mt-2 flex flex-col text-gray-500 xl:flex-row">
                      <div className="flex items-start space-x-3">
                        <dt className="mt-0.5">
                          <span className="sr-only">Date</span>
                          <CalendarIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </dt>
                        <dd>
                          <time dateTime={avail.appointments[0].start_time}>
                            {moment(avail.appointments[0].start_time).format(
                              "Do MMMM, YYYY",
                            )}
                          </time>
                        </dd>
                      </div>
                    </dl>
                    <Grid templateColumns="repeat(3, 1fr)" gap={2} mt={4}>
                      {avail.appointments.map((apt) => {
                        return (
                          <Button
                            key={apt.id}
                            variant={"outline"}
                            onClick={() => {
                              setClickedApt(apt);
                              onOpen();
                            }}
                          >
                            {moment(apt.start_time).format("hh:mm A")}
                          </Button>
                        );
                      })}
                    </Grid>
                  </div>
                </li>
              ))}
              {apts.length === 0 ? (
                <li className="relative flex space-x-6 py-6 xl:static">
                  <div className="flex items-center text-center text-gray-900">
                    <div className="flex-auto text-sm font-semibold">
                      No appointments for this date.
                    </div>
                  </div>
                </li>
              ) : null}
            </Skeleton>
          </ol>
        </div>
      </Container>
    </Stack>
  );
}
