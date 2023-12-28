import type { NextPageWithLayout } from "../../_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../../../components/layout";
import { ReactElement } from "react";
import Head from "next/head";
import { Flex } from "@chakra-ui/react";
import { BookAptForm } from "../../../components/book-apt/book";
import { useLoading } from "../../../state/loading";
import { components } from "../../../schemas/api-types";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
import { withPageToken } from "../../../components/auth0-utils";
type BookingType = components["schemas"]["Appointment"];

interface CreateAppointmentProps {
  patient_id: string;
}

const CreateAppointmentPage: NextPageWithLayout<CreateAppointmentProps> = ({
  patient_id,
}) => {
  const { setLoading } = useLoading();
  const { push } = useRouter();

  const submitBooking = async (patient_id: string, data: BookingType) => {
    setLoading(true);
    const url = `/api/staff/appointment/${patient_id}/create`;
    const createPractice: Promise<AxiosResponse<BookingType>> = axios.post(
      url,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    await createPractice;
    setLoading(false);
    push(`/appointments`);
  };

  return (
    <Flex>
      <BookAptForm
        onSubmit={(d) => {
          submitBooking(patient_id, d);
        }}
      />
    </Flex>
  );
};

CreateAppointmentPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Create Appointment</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const patient_id: string = (ctx.query.patient_id as string) || "";
    return {
      props: {
        patient_id,
      },
    };
  }),
});

export default CreateAppointmentPage;
