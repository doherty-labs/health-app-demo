import moment from "moment";
import { components } from "../../schemas/api-types";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  Container,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Icon,
  IconButton,
  Select,
  Skeleton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
} from "@chakra-ui/react";
import _ from "lodash";
import { FiArrowRight, FiDownload, FiSend } from "react-icons/fi";
import { use, useEffect, useState } from "react";
import { useLoading } from "../../state/loading";
import {
  AssignUserDropdownComponent,
  AssignUserDropdownProps,
} from "../assign-user/assign-user";
type AppointmentType = components["schemas"]["Appointment"];
type StatesType = components["schemas"]["States"]["states"][0];
type BookingType = components["schemas"]["Booking"];

export interface AppointmentDetailsProps {
  appointment: AppointmentType;
  bookings: BookingType[];
  states: StatesType[];
  onSubmitComment: (comment: string) => void;
  assignUserProps: AssignUserDropdownProps;
  onDownloadPatientFile: (id: number) => void;
  onDownloadAppointmentFile: (id: number) => void;
  onChangeState: (stateId: string) => void;
  onChangePriority: (priority: number) => void;
  onSendBookingInvite: () => void;
  onBookingStatusChange: (bookingId: number, status: string) => void;
}

interface AppointmentStatusProps {
  onClick: (status: string) => void;
  initialStatus?: string;
}

function AppointmentStatusComponent({
  onClick,
  initialStatus,
}: AppointmentStatusProps) {
  const [status, setStatus] = useState<string>(initialStatus || "");
  useEffect(() => {
    setStatus(initialStatus || "");
  }, [initialStatus]);
  return (
    <Stack direction={"row"}>
      <Select
        placeholder="Select attendance status"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
        }}
      >
        <option value="no_show">No Show</option>
        <option value="attended">Attended</option>
        <option value="cancelled">Cancelled</option>
      </Select>
      <Button
        variant={"outline"}
        onClick={() => {
          onClick(status);
        }}
      >
        Save
      </Button>
    </Stack>
  );
}

export function AppointmentDetailsComponent({
  appointment,
  states,
  bookings,
  onSubmitComment,
  onDownloadPatientFile,
  onDownloadAppointmentFile,
  onChangeState,
  onChangePriority,
  onSendBookingInvite,
  onBookingStatusChange,
  assignUserProps,
}: AppointmentDetailsProps) {
  const { loading } = useLoading();
  const [comment, setComment] = useState("");
  const address_keys = [
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "zip_code",
    "country",
  ];
  const mappedAddress = _.chain(address_keys)
    .map((key: string) => {
      const patient: any = appointment.patient;
      return patient?.[key];
    })
    .compact()
    .join(", ")
    .value();
  return (
    <Stack overflow={"hidden"} divider={<Divider />}>
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

            <BreadcrumbItem>
              <BreadcrumbLink href="/appointments">Appointments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Manage</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                Appointment Details
              </Heading>
              <Text color="fg.muted">
                View details of the appointment and manage it.
              </Text>
            </Stack>
            <Stack spacing="1">
              <Button
                variant={"solid"}
                colorScheme="blue"
                onClick={() => {
                  onSendBookingInvite();
                }}
              >
                <Icon as={FiSend} mr="2" />
                Send Booking Invite
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Skeleton isLoaded={!loading}>
        <Stack w={"100%"} direction={"column"} p={4}>
          <Stack direction={"row"} overflowX={"scroll"}>
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
                  Patient Details
                </Text>
                <Text color="muted">
                  Personal details of the patient who booked the appointment.
                </Text>
              </Stack>
              <HStack justify={"space-between"}>
                <Text fontSize={"md"} as={"b"} color={"muted"}>
                  Name:
                </Text>
                <Text>{appointment.patient?.full_name}</Text>
              </HStack>

              <HStack justify={"space-between"}>
                <Text fontSize={"md"} as={"b"} color={"muted"}>
                  Email:
                </Text>
                <Text>{appointment.patient?.email}</Text>
              </HStack>

              <HStack justify={"space-between"}>
                <Text fontSize={"md"} as={"b"} color={"muted"}>
                  Phone:
                </Text>
                <Text>{appointment.patient?.phone}</Text>
              </HStack>
              <HStack justify={"space-between"}>
                <Text fontSize={"md"} as={"b"} color={"muted"}>
                  Date of birth:
                </Text>
                <Text>
                  {moment(appointment.patient?.date_of_birth).format(
                    "DD/MM/YYYY",
                  )}{" "}
                  ({moment().diff(appointment.patient?.date_of_birth, "years")}{" "}
                  years old)
                </Text>
              </HStack>
              <HStack justify={"space-between"}>
                <Text fontSize={"md"} as={"b"} color={"muted"}>
                  Gender:
                </Text>
                <Text> {_.startCase(appointment.patient?.gender)}</Text>
              </HStack>
              <Stack direction={"column"}>
                <Text fontSize={"md"} as={"b"} color={"muted"}>
                  Address:
                </Text>
                <Text noOfLines={5} maxW={"sm"}>
                  {mappedAddress}
                </Text>
              </Stack>
              {appointment.patient?.documents &&
              appointment.patient?.documents?.length > 0 ? (
                <Stack direction={"column"}>
                  <Stack w={"100%"}>
                    <Text as={"b"} color={"muted"}>
                      KYC Documents
                    </Text>
                    <Stack divider={<Divider />} justify={"space-between"}>
                      {appointment?.patient?.documents?.map((doc) => {
                        return (
                          <HStack key={doc.id} justify={"space-between"}>
                            {doc.is_proof_of_address ? (
                              <Text>Proof of Address</Text>
                            ) : null}
                            {doc.is_id ? <Text>ID Document</Text> : null}
                            <Text>
                              {moment(doc.uploaded_at).format("DD/MM/YYYY")}
                            </Text>
                            <ButtonGroup>
                              <IconButton
                                icon={<FiDownload fontSize="1.25rem" />}
                                aria-label="download"
                                variant={"outline"}
                                onClick={() => {
                                  if (!doc.id) return;
                                  onDownloadPatientFile(doc.id);
                                }}
                              />
                            </ButtonGroup>
                          </HStack>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Stack>
              ) : null}
            </Stack>
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
                  Symptoms Details
                </Text>
                <Text color="muted">
                  Details of the symptoms the patient is experiencing.
                </Text>
              </Stack>
              <HStack justify={"space-between"}>
                <Text fontSize={"md"} as={"b"} color={"muted"}>
                  Category:
                </Text>
                <Text>{appointment.symptom_category}</Text>
              </HStack>
              <HStack justify={"space-between"}>
                <Text fontSize={"md"} as={"b"} color={"muted"}>
                  Duration:
                </Text>
                <Text>
                  {moment
                    .duration(appointment.symptoms_duration_seconds, "seconds")
                    .humanize()}
                </Text>
              </HStack>
              {appointment?.documents && appointment?.documents?.length > 0 ? (
                <Stack direction={"column"}>
                  <Text as={"b"} color={"muted"}>
                    Patient Files
                  </Text>
                  <Stack divider={<Divider />} justify={"space-between"}>
                    {appointment.documents?.map((doc) => {
                      return (
                        <HStack key={doc.id} justify={"space-between"}>
                          <Text>File</Text>
                          <Text>
                            {moment(doc.uploaded_at).format("DD/MM/YYYY")}
                          </Text>
                          <ButtonGroup>
                            <IconButton
                              icon={<FiDownload fontSize="1.25rem" />}
                              aria-label="download"
                              variant={"outline"}
                              onClick={() => {
                                if (!doc.id) return;
                                onDownloadAppointmentFile(doc.id);
                              }}
                            />
                          </ButtonGroup>
                        </HStack>
                      );
                    })}
                  </Stack>
                </Stack>
              ) : null}

              <Stack direction={"column"}>
                <Text fontSize={"md"} as={"b"} color={"muted"}>
                  Description:
                </Text>
                <Text>{appointment.symptoms}</Text>
              </Stack>
            </Stack>
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
                  Actions
                </Text>
                <Text color="muted">Change state or priority</Text>
              </Stack>
              <Stack justify={"center"} align={"center"}>
                <AvatarGroup size="sm" max={5}>
                  {_.chain(appointment.viewed_logs)
                    .map((i) => {
                      return {
                        id: i.viewed_by?.id,
                        name: i.viewed_by?.full_name,
                      };
                    })
                    .uniqBy("id")
                    .value()
                    .map((log) => {
                      return <Avatar key={log.id} name={log.name} />;
                    })}
                </AvatarGroup>
                <Text color="fg.muted">Viewed By</Text>
              </Stack>
              <Stack>
                <FormControl>
                  <FormLabel>Assigned to</FormLabel>
                  <AssignUserDropdownComponent {...assignUserProps} />
                </FormControl>
                <FormControl>
                  <FormLabel>State</FormLabel>
                  <Select
                    placeholder="Change State"
                    value={appointment.state}
                    onChange={(e) => {
                      onChangeState(e.target.value);
                    }}
                  >
                    {states.map((state) => {
                      return (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    placeholder="Select Priority"
                    value={appointment.priority || ""}
                    onChange={(e) => {
                      onChangePriority(parseInt(e.target.value));
                    }}
                  >
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            bg="bg-surface"
            boxShadow={"sm"}
            borderRadius={"lg"}
            p={4}
            minW={"sm"}
            divider={<Divider />}
            hidden={bookings.length === 0}
          >
            {bookings.map((booking) => {
              return (
                <Stack
                  key={booking.id}
                  direction={"row"}
                  gap={5}
                  justify={"center"}
                >
                  <Stack direction={"row"} mt={2}>
                    <Text as={"b"} color={"muted"}>
                      Appointment time:
                    </Text>
                    <Text>
                      {moment(booking.available_appointment?.start_time).format(
                        "lll",
                      )}
                    </Text>
                  </Stack>
                  <AppointmentStatusComponent
                    initialStatus={booking.attendance_status}
                    onClick={(s) => {
                      if (!booking.id) return;
                      onBookingStatusChange(booking.id, s);
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
          <Stack
            bg="bg-surface"
            boxShadow={"sm"}
            borderRadius={"lg"}
            p={4}
            minW={"sm"}
          >
            <Stack pt={2}>
              <Tabs size={"md"} variant="with-line">
                <TabList>
                  <Tab>Comments</Tab>
                  <Tab>Timeline</Tab>
                  <Tab>Assigned History</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Stack gap={2} divider={<Divider />}>
                      <Stack>
                        <Textarea
                          value={comment}
                          onChange={(e) => {
                            setComment(e.target.value);
                          }}
                        />
                        <Stack direction={"row"}>
                          <Button
                            variant={"solid"}
                            onClick={() => {
                              onSubmitComment(comment);
                              setComment("");
                            }}
                          >
                            Add Comment
                          </Button>
                        </Stack>
                      </Stack>

                      {appointment.comments &&
                      appointment.comments?.length > 0 ? (
                        <Stack direction={"column"} divider={<Divider />}>
                          {appointment.comments?.map((comment) => {
                            return (
                              <Stack
                                key={comment.id}
                                borderRadius="lg"
                                borderColor={"gray.200"}
                                borderWidth={"0.1rem"}
                                justify={"space-between"}
                                px={"6"}
                                gap={2}
                              >
                                <Text pt={"6"}>{comment.comment}</Text>
                                <HStack pb={"4"}>
                                  <Avatar
                                    size={"xs"}
                                    name={comment.user?.full_name}
                                  />
                                  <Text>{comment.user?.full_name}</Text>
                                  <Text color={"muted"}>
                                    {moment(comment.created_at).fromNow()}
                                  </Text>
                                </HStack>
                              </Stack>
                            );
                          })}
                        </Stack>
                      ) : null}
                    </Stack>
                  </TabPanel>
                  <TabPanel>
                    <Stack
                      direction={"column"}
                      divider={<Divider />}
                      overflowY={"scroll"}
                    >
                      {appointment.logs?.map((log) => {
                        return (
                          <Stack key={log.id} direction={"column"}>
                            <HStack>
                              <Badge hidden={log.from_state === ""}>
                                {_.startCase(log.from_state)}
                              </Badge>
                              <Icon
                                as={FiArrowRight}
                                boxSize="5"
                                color="muted"
                              />
                              <Badge colorScheme="green">
                                {_.startCase(log.to_state)}
                              </Badge>
                            </HStack>
                            <HStack>
                              <Text>
                                Triggered by {log.triggered_by?.full_name}
                              </Text>
                              <Text color={"muted"}>
                                {moment(log.created_at).fromNow()}
                              </Text>
                            </HStack>
                          </Stack>
                        );
                      })}
                      {appointment.logs?.length === 0 ? (
                        <Text color={"muted"}>No timeline</Text>
                      ) : null}
                    </Stack>
                  </TabPanel>
                  <TabPanel>
                    <Stack>
                      <Stack direction={"column"} divider={<Divider />}>
                        {appointment.assign_history?.map((history) => {
                          return (
                            <Stack key={history.id}>
                              <HStack>
                                <Badge>
                                  {history.from_user
                                    ? history.from_user?.full_name
                                    : "Unassigned"}
                                </Badge>
                                <Icon
                                  as={FiArrowRight}
                                  boxSize="5"
                                  color="muted"
                                />
                                <Badge colorScheme={"green"}>
                                  {history.to_user
                                    ? history.to_user?.full_name
                                    : "Unassigned"}
                                </Badge>
                              </HStack>
                              <HStack>
                                <Text>
                                  Triggered by {history.triggered_by?.full_name}
                                </Text>
                                <Text color={"muted"}>
                                  {moment(history.created_at).fromNow()}
                                </Text>
                              </HStack>
                            </Stack>
                          );
                        })}

                        {appointment.assign_history?.length === 0 ? (
                          <Text color={"muted"}>No assignee history</Text>
                        ) : null}
                      </Stack>
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Stack>
          </Stack>
        </Stack>
      </Skeleton>
    </Stack>
  );
}
