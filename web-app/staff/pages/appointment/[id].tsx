import type { NextPageWithLayout } from "../_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../../components/layout";
import { ReactElement, useEffect, useState } from "react";
import { getAppointment } from "../api/appointment/[id]";
import { components } from "../../schemas/api-types";
import { AppointmentDetailsComponent } from "../../components/appointment/details";
import axios, { AxiosResponse } from "axios";
import { useLoading } from "../../state/loading";
import { useSearchUser } from "../../components/assign-user/search-user";
import { useSearchLoading } from "../../state/search";
import Head from "next/head";
import { useRouter } from "next/router";
import { getAppointmentStates } from "../api/states/appointment";
import { useToast } from "@chakra-ui/react";
import { getBookingOptions } from "../api/booking/search";
import { withPageToken } from "../../components/auth0-utils";
type AppointmentType = components["schemas"]["Appointment"];
type StaffApiType = components["schemas"]["StaffMember"];
type StatesType = components["schemas"]["States"]["states"][0];
type BookingType = components["schemas"]["Booking"];
interface ResProps {
  appointmentInit: AppointmentType;
  states: StatesType[];
  bookingsInit: BookingType[];
}

const AppointmentGetPage: NextPageWithLayout<ResProps> = ({
  appointmentInit,
  states,
  bookingsInit,
}) => {
  const { setLoading } = useLoading();
  const { push } = useRouter();
  const [apt, setApt] = useState<AppointmentType>(appointmentInit);
  const [bookings, setBooking] = useState<BookingType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const toast = useToast();

  const { staffMembers } = useSearchUser({ term: searchTerm });
  const { actions } = useSearchLoading();

  useEffect(() => {
    setBooking(bookingsInit);
  }, [bookingsInit]);

  const updateAppointment = async (appointment: AppointmentType) => {
    const { data } = await axios.put<AppointmentType>(
      `/api/appointment/${appointment.id}`,
      appointment,
    );
    return data;
  };

  const updateBooking = async (booking: BookingType) => {
    const { data } = await axios.put<BookingType>(
      `/api/booking/${booking.id}/manage`,
      booking,
    );
    return data;
  };

  const getAppointment = async (appointment: AppointmentType) => {
    const { data } = await axios.get<AppointmentType>(
      `/api/appointment/${appointment.id}`,
    );
    return data;
  };

  const getBooking = async (booking: BookingType) => {
    const { data } = await axios.get<BookingType>(
      `/api/booking/${booking.id}/manage`,
    );
    return data;
  };

  const bookingInvite = async (appointment: AppointmentType) => {
    const { data } = await axios.post<AppointmentType>(
      `/api/booking/appointment/${appointment.id}/create-invitation`,
      {},
    );
    return data;
  };

  const addComment = async (comment: string) => {
    setLoading(true);
    await updateAppointment({
      ...apt,
      comments: [
        ...(apt.comments || []),
        {
          comment: comment,
          appointment_id: apt.id || 0,
        },
      ],
    });
    const data = await getAppointment(apt);
    setApt(data);
    setLoading(false);
  };

  const assignUser = async (staffMember: StaffApiType) => {
    actions.setLoading(true);
    await updateAppointment({
      ...apt,
      assigned_to_id: staffMember.id,
    });
    const data = await getAppointment(apt);
    setApt(data);
    actions.setLoading(false);
  };

  const unassignUser = async () => {
    actions.setLoading(true);
    await updateAppointment({
      ...apt,
      assigned_to_id: undefined,
    });
    const data = await getAppointment(apt);
    setApt(data);
    actions.setLoading(false);
  };

  const getDownloadPatientFileUrl = async (id: number) => {
    const url = `/api/patient/document/${id}`;
    const createPractice: Promise<AxiosResponse> = axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await createPractice;
    const downloadUrl = result.data;
    return downloadUrl;
  };

  const getDownloadAptFileUrl = async (id: number) => {
    const url = `/api/appointment/document/${id}`;
    const createPractice: Promise<AxiosResponse> = axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await createPractice;
    const downloadUrl = result.data;
    return downloadUrl;
  };

  const changeAptState = async (stateId: string) => {
    setLoading(true);
    await updateAppointment({
      ...apt,
      state: stateId,
    });
    const data = await getAppointment(apt);
    setApt(data);
    setLoading(false);
  };

  const changeAptPriority = async (priority: number) => {
    setLoading(true);
    await updateAppointment({
      ...apt,
      priority: priority,
    });
    const data = await getAppointment(apt);
    setApt(data);
    setLoading(false);
  };

  const onSendBookingInvite = async () => {
    setLoading(true);
    await bookingInvite(apt);
    const data = await getAppointment(apt);
    setApt(data);
    setLoading(false);
    toast({
      title: "Invitation Sent",
      description: "Booking invitation sent to patient.",
      status: "success",
      duration: 9000,
      isClosable: true,
    });
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
      setBooking((bookings) =>
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
    <AppointmentDetailsComponent
      appointment={apt}
      bookings={bookings}
      states={states}
      onBookingStatusChange={async (bookingId, status) => {
        onBookingStatusChange(bookingId, status);
      }}
      onSendBookingInvite={() => {
        onSendBookingInvite();
      }}
      onChangeState={async (state) => {
        changeAptState(state);
      }}
      onChangePriority={async (priority) => {
        changeAptPriority(priority);
      }}
      onSubmitComment={(c) => {
        addComment(c);
      }}
      onDownloadPatientFile={async (id) => {
        setLoading(true);
        const downloadUrl = await getDownloadPatientFileUrl(id);
        push(downloadUrl);
        setLoading(false);
      }}
      onDownloadAppointmentFile={async (id) => {
        setLoading(true);
        const downloadUrl = await getDownloadAptFileUrl(id);
        push(downloadUrl);
        setLoading(false);
      }}
      assignUserProps={{
        onAssignUser: (u) => {
          assignUser(u);
        },
        onSearch: (t) => {
          setSearchTerm(t);
        },
        onClearAssignedUser: () => {
          unassignUser();
        },
        staffMembers: staffMembers,
        assignedUser: apt.assigned_to
          ? {
              ...apt.assigned_to,
              job_title: "",
              first_name: apt.assigned_to?.first_name || "",
              last_name: apt.assigned_to?.last_name || "",
              email: apt.assigned_to?.email || "",
              full_name: `${apt.assigned_to?.first_name} ${apt.assigned_to?.last_name}`,
            }
          : undefined,
      }}
    />
  );
};

AppointmentGetPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Manage Appointment</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const id = ctx.query.id as string;
    const { request, data } = await getAppointment(id, token);
    const { data: statesData } = await getAppointmentStates(token);
    const { data: bookings } = await getBookingOptions(
      token,
      `appointment_id=${id}`,
    );

    if (request.status === 404) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        appointmentInit: data,
        states: statesData.states,
        bookingsInit: bookings.results,
      },
    };
  }),
});

export default AppointmentGetPage;
