import type { NextPageWithLayout } from "../_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../../components/layout";
import { ReactElement, useEffect, useState } from "react";
import Head from "next/head";
import { components } from "../../schemas/api-types";
import { getBookingInvite } from "../api/booking/invite/[id]";
import { useBookingOptions } from "../../components/hooks/booking-options";
import { BookTimeComponent } from "../../components/book-apt/pick-time";
import moment from "moment";
import axios, { AxiosResponse } from "axios";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  Text,
  Button,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { withPageToken } from "../../components/auth0-utils";

type BookingInviteType = components["schemas"]["BookingInvite"];
type BookingType = components["schemas"]["Booking"];

interface ResProps {
  invite: BookingInviteType;
}

const BookingPage: NextPageWithLayout<ResProps> = ({ invite }) => {
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [teamMemberId, setTeamMemberId] = useState<string>("");
  const toast = useToast();
  const { push, replace } = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { availability } = useBookingOptions({
    fromDate: moment(fromDate).format("YYYY-MM-DD"),
    toDate: moment(toDate).format("YYYY-MM-DD"),
    practiceId: invite.practice_id.toString(),
    teamMemberId: teamMemberId,
  });

  const submitBooking = async (booking: BookingType) => {
    const url = `/api/booking/create`;
    const createBooking: Promise<AxiosResponse<BookingType>> = axios.post(
      url,
      booking,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const result = await createBooking;
    const downloadUrl = result.data;
    return downloadUrl;
  };

  useEffect(() => {
    if (invite.can_book === false) {
      onOpen();
    }
    console.log(invite);
  }, [invite, onOpen]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnEsc={false}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Booking</ModalHeader>
          <ModalBody>
            <Text>This booking session has expired!</Text>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                push("/appointments");
              }}
            >
              Appointments
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <BookTimeComponent
        availability={availability}
        onDateChange={(d) => {
          setFromDate(d);
          setToDate(d);
        }}
        onPickTime={async (a) => {
          if (a.id && invite.id && invite.appointment_id) {
            await submitBooking({
              appointment_id: invite.appointment_id,
              available_appointment_id: a.id,
              invitation_id: invite.id,
            });
            toast({
              title: "Booking successful",
              description: "Your appointment is booked.",
              status: "success",
              duration: 9000,
              isClosable: true,
            });
            replace("/appointments");
          }
        }}
      />
    </>
  );
};

BookingPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Book - Pick a time</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const id = ctx.query.id as string;
    const { data } = await getBookingInvite(id, token);

    if (!data.id) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        invite: data,
      },
    };
  }),
});

export default BookingPage;
