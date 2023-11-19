import type { NextPageWithLayout } from "../../_app";
import { withPageAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
import Layout from "../../../components/layout";
import { ReactElement } from "react";
import Head from "next/head";
import { Flex } from "@chakra-ui/react";
import { BookAptForm } from "../../../components/book-apt/book";
import { useLoading } from "../../../state/loading";
import { components } from "../../../schemas/api-types";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
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
  getServerSideProps: async (ctx) => {
    const patient_id: string = (ctx.query.patient_id as string) || "";
    let token: string = "";
    try {
      const { accessToken } = await getAccessToken(ctx.req, ctx.res);
      token = accessToken as string;
    } catch (e) {
      return {
        redirect: {
          destination: `/api/auth/login?returnTo=/appointments/${patient_id}/create`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        patient_id,
      },
    };
  },
});

export default CreateAppointmentPage;
