import type { NextPageWithLayout } from "../_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../../components/layout";
import { ReactElement } from "react";
import Head from "next/head";
import { CreateAppointmentComponent } from "../../components/appointment/create";
import { withPageToken } from "../../components/auth0-utils";

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
  getServerSideProps: withPageToken(async (ctx, token) => {
    return {
      props: {},
    };
  }),
});

export default CreateAppointmentPage;
