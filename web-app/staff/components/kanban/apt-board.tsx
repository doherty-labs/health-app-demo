import {
  Container,
  Stack,
  Text,
  Divider,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Skeleton,
  Spinner,
  HStack,
  Avatar,
  Center,
  InputGroup,
  InputLeftElement,
  Icon,
  Input,
  IconProps,
  Button,
} from "@chakra-ui/react";
import { components } from "../../schemas/api-types";
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useKanbanLoading, useLoading } from "../../state/loading";
import moment from "moment";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import _ from "lodash";
import { useRouter } from "next/router";

type StatesType = components["schemas"]["States"]["states"][0];
type AppointmentType = components["schemas"]["Appointment"];

interface AppointmentByLane {
  appointments: AppointmentType[];
  lane: StatesType;
  count: number | undefined;
  next: string;
  previous: string;
  onDropEvent: (appointment: AppointmentType, lane: StatesType) => void;
  onNextPageEvent: (lane: StatesType) => void;
  onClickEvent: (appointment: AppointmentType) => void;
}

interface KanbanBoardProps {
  lanes: StatesType[];
  appointmentsByLanes: Omit<
    AppointmentByLane,
    "onDropEvent" | "onNextPageEvent" | "onClickEvent"
  >[];
  onDropEvent: (appointment: AppointmentType, lane: StatesType) => void;
  onNextPageEvent: (lane: StatesType) => void;
  onClickEvent: (appointment: AppointmentType) => void;
  onSearchEvent: (search: string) => void;
}

const CircleIcon = (props: IconProps) => (
  <Icon viewBox="0 0 200 200" {...props}>
    <path
      fill="currentColor"
      d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
    />
  </Icon>
);

export function LaneCardComponent({
  appointment,
  onClickEvent,
}: {
  appointment: AppointmentType;
  onClickEvent: () => void;
}) {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: "appointment",
      item: {
        appointment,
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0 : 1,
      }),
    }),
    [appointment],
  );
  return (
    <Stack
      bg="bg-surface"
      boxShadow={"sm"}
      borderRadius={"lg"}
      p={4}
      cursor={"pointer"}
      userSelect={"none"}
      opacity={opacity}
      ref={drag}
      onClick={onClickEvent}
      divider={<Divider />}
    >
      <Stack>
        <HStack justify={"space-between"}>
          <Text fontSize="sm">{appointment.symptom_category}</Text>
          {appointment.viewed_logs && appointment.viewed_logs?.length === 0 ? (
            <HStack>
              <CircleIcon boxSize={4} color="blue.500" />
              <Text fontSize={"xs"} color={"muted"}>
                Unread
              </Text>
            </HStack>
          ) : null}
        </HStack>

        <HStack justify={"space-between"}>
          <HStack>
            <Text fontSize="sm" color={"muted"} fontWeight={"semibold"}>
              Patient:
            </Text>
            <Text fontSize="sm" noOfLines={1}>
              {" "}
              {appointment.patient?.full_name}
            </Text>
          </HStack>
          <HStack>
            <Text fontSize="sm" color={"muted"} noOfLines={1}>
              {moment(appointment.updated_at || "").fromNow()}
            </Text>
          </HStack>
        </HStack>
      </Stack>
      {appointment.assigned_to ? (
        <HStack>
          <Text fontSize="sm" color={"muted"} fontWeight={"semibold"}>
            Assigned to:
          </Text>
          <HStack>
            <Avatar size="xs" name={appointment.assigned_to?.full_name} />
            <Text fontSize="sm" noOfLines={1}>
              {appointment.assigned_to?.full_name}
            </Text>
          </HStack>
        </HStack>
      ) : null}
    </Stack>
  );
}

export function LaneComponent({
  lane,
  appointments,
  count,
  onDropEvent,
  onNextPageEvent,
  onClickEvent,
}: AppointmentByLane) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ["appointment"],
    drop: (item: any) => {
      const appointment = item.appointment as AppointmentType;
      onDropEvent(appointment, lane);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    canDrop(item: any, monitor) {
      if (item.appointment.state === lane.id) {
        return false;
      }
      return true;
    },
  });

  const isActive = isOver && canDrop;
  let backgroundColor = "bg-muted";
  if (isActive) {
    backgroundColor = "var(--chakra-colors-green-300)";
  } else if (canDrop) {
    backgroundColor = "var(--chakra-colors-gray-300)";
  }

  const { loading } = useLoading();
  const { states } = useKanbanLoading();

  return (
    <Skeleton isLoaded={!loading}>
      <Stack
        bg="bg-surface"
        boxShadow={"sm"}
        borderRadius={"lg"}
        p={4}
        minW={"sm"}
        divider={<Divider />}
      >
        <Stack>
          <Text fontSize="md" fontWeight={"semibold"}>
            {lane.name}
          </Text>
          <Text color="muted">{lane.description}</Text>
        </Stack>

        <Stack
          bg={backgroundColor}
          borderRadius={"lg"}
          w={"100%"}
          h={"md"}
          overflowX={"scroll"}
          p={2}
          spacing={2}
          ref={drop}
          onScroll={(e) => {
            if (
              e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
              e.currentTarget.clientHeight
            ) {
              onNextPageEvent(lane);
            }
          }}
        >
          <Stack>
            {appointments.map((appointment) => {
              return (
                <LaneCardComponent
                  key={appointment.id}
                  appointment={appointment}
                  onClickEvent={() => {
                    onClickEvent(appointment);
                  }}
                />
              );
            })}
          </Stack>
        </Stack>
        {states.find((state) => state.state.id === lane.id)?.loading ? (
          <Stack bg="bg-surface" w={"100%"} justify={"center"} align={"center"}>
            <HStack spacing={4}>
              <Text>Loading</Text> <Spinner />
            </HStack>
          </Stack>
        ) : (
          <Stack bg="bg-surface" w={"100%"} justify={"center"} align={"center"}>
            <Text>Count: {count}</Text>
          </Stack>
        )}
      </Stack>
    </Skeleton>
  );
}

export function AppointmentKanbanBoard({
  appointmentsByLanes,
  onDropEvent,
  onNextPageEvent,
  onClickEvent,
  onSearchEvent,
}: KanbanBoardProps) {
  const [search, setSearch] = useState("");
  const { push } = useRouter();

  useEffect(() => {
    onSearchEvent(search);
  }, [search, onSearchEvent]);

  return (
    <Stack overflow={"hidden"} divider={<Divider />} pb={"4rem"}>
      <Box
        as="section"
        bg="bg.surface"
        pt={{ base: "4", md: "8" }}
        pb={{ base: "6", md: "6" }}
      >
        <Container>
          <Breadcrumb mb={4}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Appointments</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                Manage Appointment
              </Heading>
              <Text color="fg.muted">
                All appointments are listed here. You can drag and drop.
              </Text>
            </Stack>
            <Stack>
              <Button
                variant={"outline"}
                onClick={() => {
                  push("/appointments/create");
                }}
              >
                Create Appointment
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Center p={4}>
        <Stack position={"relative"} w={"100%"} maxW={{ md: "sm" }}>
          <InputGroup size="lg" w={"100%"} maxW={{ md: "sm" }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="fg-muted" boxSize="5" />
            </InputLeftElement>
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </InputGroup>
        </Stack>
      </Center>
      <DndProvider backend={HTML5Backend}>
        <Stack
          direction={"row"}
          spacing={4}
          overflowX={"scroll"}
          pt={4}
          pb={"2rem"}
          px={8}
        >
          {appointmentsByLanes.map((lane) => {
            return (
              <LaneComponent
                key={lane.lane.id}
                lane={lane.lane}
                count={lane.count}
                next={lane.next}
                previous={lane.previous}
                appointments={lane.appointments}
                onDropEvent={onDropEvent}
                onNextPageEvent={onNextPageEvent}
                onClickEvent={onClickEvent}
              />
            );
          })}
          {appointmentsByLanes.length === 0 ? (
            <Stack direction={"row"}>
              <Skeleton height={"md"} width={"sm"} />
              <Skeleton height={"md"} width={"sm"} />
              <Skeleton height={"md"} width={"sm"} />
              <Skeleton height={"md"} width={"sm"} />
              <Skeleton height={"md"} width={"sm"} />
              <Skeleton height={"md"} width={"sm"} />
              <Skeleton height={"md"} width={"sm"} />
            </Stack>
          ) : null}
        </Stack>
      </DndProvider>
    </Stack>
  );
}
