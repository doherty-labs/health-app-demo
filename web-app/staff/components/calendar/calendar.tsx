import {
  Container,
  Divider,
  Stack,
  Box,
  Heading,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Skeleton,
  Link,
} from "@chakra-ui/react";
import { AllCalendarProps, EventProps } from "./interfaces";
import CalendarMonthlyComponent from "./calendar-month";
import CalendarDayView from "./calendar-day";
import CalendarWeeklyComponent from "./calendar-weekly";
import {
  AvailFormType,
  AvailYupSchema,
  AvailabilityForm,
} from "../availability/form";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCalendarDateState } from "./context";
import moment from "moment";
import { useEffect, useState } from "react";
import { useLoading } from "../../state/loading";
import _ from "lodash";

export function CalendarComponent({
  events,
  pageTitle,
  onEventCreate,
}: AllCalendarProps) {
  const {
    isOpen: availOpen,
    onOpen: availOnOpen,
    onClose: availOnClose,
  } = useDisclosure();

  const {
    isOpen: bookingOpen,
    onOpen: bookingOnOpen,
    onClose: bookingOnClose,
  } = useDisclosure();

  const methods = useForm({
    resolver: yupResolver(AvailYupSchema),
  });
  const { currentDate, calendarView, actions } = useCalendarDateState();
  const { loading } = useLoading();
  const [eventsState, setEventsState] = useState<EventProps[]>(events);
  const [lastClickedEvent, setLastClickedEvent] = useState<EventProps>();

  useEffect(() => {
    setEventsState(events);
  }, [events]);

  useEffect(() => {
    methods.setValue("target_date", moment(currentDate).format("DD/MM/YYYY"));
  }, [currentDate, methods]);

  const onEventClick = (e: EventProps) => {
    const release_time = moment(e.start).diff(
      moment(e.scheduleReleaseTime),
      "seconds",
    );
    methods.reset();
    methods.setValue("id", Number(e.id));
    methods.setValue("target_date", moment(e.start).format("DD/MM/YYYY"));
    methods.setValue("start_time", moment(e.start).format("HH:mm"));
    methods.setValue("end_time", moment(e.end).format("HH:mm"));
    methods.setValue("schedule_release_time_delta", release_time);
    setLastClickedEvent(e);
    if (e.bookings && e.bookings.length > 0) {
      bookingOnOpen();
    } else {
      availOnOpen();
    }
  };

  return (
    <Stack divider={<Divider />}>
      <Box as="section" bg="bg.surface" pt={8} pb={6}>
        <Modal isOpen={bookingOpen} onClose={bookingOnClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Booking</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack divider={<Divider />}>
                {lastClickedEvent?.bookings?.map((b) => {
                  return (
                    <Stack key={b.id}>
                      <Text>
                        Appointment:{" "}
                        <Link
                          href={`/appointment/${b.appointment_id}`}
                          color="blue.500"
                          as={"b"}
                        >
                          {b.appointment?.patient?.full_name}
                        </Link>
                      </Text>
                      <Text>Status: {_.startCase(b.appointment?.state)}</Text>
                    </Stack>
                  );
                })}
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={bookingOnClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={availOpen} onClose={availOnClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Availability</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormProvider {...methods}>
                <AvailabilityForm />{" "}
              </FormProvider>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={methods.handleSubmit(
                  (data) => {
                    onEventCreate(data as AvailFormType);
                    availOnClose();
                  },
                  (err) => {
                    console.log(err);
                  },
                )}
              >
                Submit
              </Button>
              <Button variant="ghost" onClick={availOnClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Container>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                {pageTitle}
              </Heading>
              <Text color="fg.muted">Manage available time slots.</Text>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container pb={8}>
        <Skeleton isLoaded={!loading}>
          <Stack>
            {calendarView === "monthly" ? (
              <CalendarMonthlyComponent
                events={eventsState}
                onEventClick={(e) => {
                  actions.setCalendarView("daily");
                  actions.setDate(e.start);
                  onEventClick(e);
                }}
                onEventCreateClick={() => {
                  methods.reset();
                  methods.setValue(
                    "target_date",
                    moment(currentDate).format("DD/MM/YYYY"),
                  );
                  availOnOpen();
                }}
                onChangePeriodicity={(p) => {
                  actions.setCalendarView(p);
                }}
              />
            ) : null}
            {calendarView === "daily" ? (
              <CalendarDayView
                events={eventsState}
                onEventClick={onEventClick}
                onEventCreateClick={() => {
                  methods.reset();
                  methods.setValue(
                    "target_date",
                    moment(currentDate).format("DD/MM/YYYY"),
                  );
                  availOnOpen();
                }}
                onChangePeriodicity={(p) => {
                  actions.setCalendarView(p);
                }}
              />
            ) : null}
            {calendarView === "weekly" ? (
              <CalendarWeeklyComponent
                events={eventsState}
                onEventClick={onEventClick}
                onEventCreateClick={() => {
                  methods.reset();
                  methods.setValue(
                    "target_date",
                    moment(currentDate).format("DD/MM/YYYY"),
                  );
                  availOnOpen();
                }}
                onChangePeriodicity={(p) => {
                  actions.setCalendarView(p);
                }}
              />
            ) : null}
          </Stack>
        </Skeleton>
      </Container>
    </Stack>
  );
}
