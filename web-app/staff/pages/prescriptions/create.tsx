import type { NextPageWithLayout } from "../_app";
import { withPageAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
import Layout from "../../components/layout";
import { ReactElement } from "react";
import Head from "next/head";
import { CreatePrescriptionComponent } from "../../components/prescription/find-patient";

const CreatePrescriptionPage: NextPageWithLayout = () => {
  return <CreatePrescriptionComponent />;
};

CreatePrescriptionPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Find Patient - Create Prescription</title>
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
          destination: `/api/auth/login?returnTo=/prescriptions/create`,
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  },
});

export default CreatePrescriptionPage;
