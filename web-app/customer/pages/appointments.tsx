import type { NextPageWithLayout } from "./_app";
import { withPageAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement, useEffect, useState } from "react";
import Head from "next/head";
import { getAppointments } from "./api/appointment/all";
import { components } from "../schemas/api-types";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  Container,
  Divider,
  HStack,
  Heading,
  List,
  ListItem,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import _ from "lodash";
import { getBookingOptions } from "./api/booking/search";
import { getPatient } from "./api/patient/manage";
import axios from "axios";
import { useLoading } from "../components/state/loading";
type AppointmentType = components["schemas"]["Appointment"];
type BookedAppointmentType = components["schemas"]["Booking"];

interface ResProps {
  apts: AppointmentType[];
  bookings: BookedAppointmentType[];
}

const AptsPage: NextPageWithLayout<ResProps> = ({ apts, bookings }) => {
  const [aptList, setAptList] = useState<AppointmentType[]>(apts);
  const { setLoading } = useLoading();
  const [bookingList, setBookingList] = useState<BookedAppointmentType[]>([]);

  useEffect(() => {
    const newApts = _.chain(apts)
      .map((apt) => {
        return {
          ...apt,
          created_at: moment(apt.created_at).format("lll"),
          updated_at: moment(apt.updated_at).format("lll"),
        };
      })
      .value();
    setAptList(newApts);
  }, [apts]);

  useEffect(() => {
    setBookingList(bookings);
  }, [bookings]);

  const updateBooking = async (booking: BookedAppointmentType) => {
    const { data } = await axios.put<BookedAppointmentType>(
      `/api/booking/${booking.id}/manage`,
      booking,
    );
    return data;
  };

  const getBooking = async (booking: BookedAppointmentType) => {
    const { data } = await axios.get<BookedAppointmentType>(
      `/api/booking/${booking.id}/manage`,
    );
    return data;
  };

  const onBookingStatusChange = async (bookingId: number, status: string) => {
    setLoading(true);
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      await updateBooking({
        ...booking,
        attendance_status: status,
      });
      const data = await getBooking(booking);
      setBookingList((bookings) =>
        bookings.map((b) => {
          if (b.id === data.id) {
            return data;
          }
          return b;
        }),
      );
    }
    setLoading(false);
  };

  return (
    <Stack divider={<Divider />}>
      <Container pt={{ base: "4", md: "8" }} pb={{ base: "6", md: "6" }}>
        <Breadcrumb>
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
          pt={4}
        >
          <Stack spacing="1">
            <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
              Appointments
            </Heading>
            <Text color="fg.muted">
              View previous appointments and their status.
            </Text>
          </Stack>
        </Stack>
      </Container>
      {aptList.length > 0 ? (
        <Center pt={4} pb={8}>
          <List listStyleType="none" maxW={"xl"} w={"100%"} spacing={4}>
            {aptList.map((apt) => (
              <ListItem
                key={apt.id}
                value={apt.id}
                bg="bg-surface"
                p="4"
                boxShadow="sm"
                position="relative"
                borderRadius="lg"
                w={"100%"}
              >
                <Stack shouldWrapChildren spacing="4">
                  <Text
                    textStyle="sm"
                    fontWeight="medium"
                    color="fg-emphasized"
                  >
                    {apt.symptom_category}
                  </Text>
                  <Text textStyle="sm" color={"muted"}>
                    {apt.symptoms}
                  </Text>
                  <HStack justify="space-between">
                    <Badge colorScheme={"green"} size="sm">
                      {apt.state}
                    </Badge>
                  </HStack>
                  <Divider />

                  {_.chain(bookingList)
                    .filter((booking) => booking.appointment?.id == apt.id)
                    .map((booking) => {
                      return (
                        <Stack
                          key={booking.id}
                          direction={"column"}
                          justify={"space-between"}
                        >
                          <Stack direction={"row"}>
                            <Text>Booked for: </Text>
                            <Text>
                              {moment(
                                booking.available_appointment?.start_time,
                              ).format("lll")}
                            </Text>
                          </Stack>
                          <Button
                            colorScheme="red"
                            hidden={booking.attendance_status === "cancelled"}
                            onClick={() => {
                              if (booking.id)
                                onBookingStatusChange(booking.id, "cancelled");
                            }}
                          >
                            Cancel Booking
                          </Button>
                        </Stack>
                      );
                    })
                    .value()}
                  <Stack>
                    <Text textStyle="sm" color={"muted"}>
                      Last Updated: {moment(apt.updated_at).fromNow()}
                    </Text>
                  </Stack>
                </Stack>
              </ListItem>
            ))}
          </List>
        </Center>
      ) : (
        <Center pt={4} hidden={aptList.length !== 0}>
          <Text textStyle="sm" color={"muted"}>
            No appointments have been made.
          </Text>
        </Center>
      )}
    </Stack>
  );
};

AptsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Appointments</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (ctx) => {
    let token: string = "";
    try {
      const { accessToken } = await getAccessToken(ctx.req, ctx.res);
      token = accessToken as string;
    } catch (e) {
      return {
        redirect: {
          destination: "/api/auth/login?returnTo=/appointments",
          permanent: false,
        },
      };
    }
    const { data, request } = await getAppointments("page=1", token);
    const { data: patient } = await getPatient(token);
    const { data: bookings } = await getBookingOptions(
      token,
      `patient_id=${patient.id}`,
    );

    if (request.status !== 200) {
      return {
        props: {
          apts: [],
        },
      };
    }

    return {
      props: {
        apts: data.results,
        bookings: bookings.results,
      },
    };
  },
});

export default AptsPage;
