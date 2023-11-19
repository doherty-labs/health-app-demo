import type { NextPageWithLayout } from "../_app";
import { withPageAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
import Layout from "../../components/layout";
import { ReactElement } from "react";
import Head from "next/head";
import { CreateAppointmentComponent } from "../../components/appointment/create";

const CreateAppointmentPage: NextPageWithLayout = () => {
  return <CreateAppointmentComponent />;
};

CreateAppointmentPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Find Patient - Create Appointment</title>
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
          destination: `/api/auth/login?returnTo=/appointments/create`,
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  },
});

export default CreateAppointmentPage;
