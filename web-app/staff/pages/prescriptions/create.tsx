import type { NextPageWithLayout } from "../_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../../components/layout";
import { ReactElement } from "react";
import Head from "next/head";
import { CreatePrescriptionComponent } from "../../components/prescription/find-patient";
import { withPageToken } from "../../components/auth0-utils";

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
  getServerSideProps: withPageToken(async (ctx) => {
    return {
      props: {},
    };
  }),
});

export default CreatePrescriptionPage;
