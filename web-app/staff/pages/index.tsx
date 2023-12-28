import Layout from "../components/layout";
import type { NextPageWithLayout } from "./_app";
import moment from "moment";
import { usePrescriptionAnalytics } from "../components/hooks/prescription-analytics";
import { ReactElement, useState } from "react";
import { useAppointmentAnalytics } from "../components/hooks/apt-analytics";
import { DashboardHome } from "../components/dashboard/dashboard";
import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { withPageToken } from "../components/auth0-utils";

const Home: NextPageWithLayout = () => {
  const [startDate, setStartDate] = useState<string>(
    moment().subtract(30, "day").format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState<string>(moment().format("YYYY-MM-DD"));
  const [interval, setInterval] = useState<string>("day");
  const { data: prescriptAnalytics } = usePrescriptionAnalytics({
    start_date: startDate,
    end_date: endDate,
    interval,
  });

  const { data: aptAnalytics } = useAppointmentAnalytics({
    start_date: startDate,
    end_date: endDate,
    interval,
  });

  return (
    <DashboardHome
      aptAnalytics={aptAnalytics}
      prescAnalytics={prescriptAnalytics}
    />
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Dashboard</title>
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

export default Home;
