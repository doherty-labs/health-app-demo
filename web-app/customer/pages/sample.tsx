import type { NextPageWithLayout } from "./_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement } from "react";
import Head from "next/head";
import { withPageToken } from "../components/auth0-utils";

interface ResProps {
  names: string[];
}

const SampleGetPage: NextPageWithLayout<ResProps> = ({ names }) => {
  return <p>{names}</p>;
};

SampleGetPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Sample</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL + "sample/get";
    const response = await fetch(baseURL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const names: ResProps = await response.json();
    return {
      props: names,
    };
  }),
});

export default SampleGetPage;
