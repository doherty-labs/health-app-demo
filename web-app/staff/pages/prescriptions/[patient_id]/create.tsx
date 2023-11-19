import type { NextPageWithLayout } from "../../_app";
import { withPageAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
import Layout from "../../../components/layout";
import { ReactElement } from "react";
import Head from "next/head";
import { Flex } from "@chakra-ui/react";
import { useLoading } from "../../../state/loading";
import { components } from "../../../schemas/api-types";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
import { PrescriptionForm } from "../../../components/prescription/create";
type PrescriptionType = components["schemas"]["Prescription"];

interface CreatePrescriptionProps {
  patient_id: string;
}

const CreatePrescriptionPage: NextPageWithLayout<CreatePrescriptionProps> = ({
  patient_id,
}) => {
  const { setLoading } = useLoading();
  const { push } = useRouter();

  const submitBooking = async (patient_id: string, data: PrescriptionType) => {
    setLoading(true);
    const url = `/api/staff/prescription/${patient_id}/create`;
    const createPractice: Promise<AxiosResponse<PrescriptionType>> = axios.post(
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
    push(`/prescriptions`);
  };

  return (
    <Flex>
      <PrescriptionForm
        onSubmit={(d) => {
          submitBooking(patient_id, d);
        }}
      />
    </Flex>
  );
};

CreatePrescriptionPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Create Prescription</title>
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
          destination: `/api/auth/login?returnTo=/prescriptions/${patient_id}/create`,
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

export default CreatePrescriptionPage;
