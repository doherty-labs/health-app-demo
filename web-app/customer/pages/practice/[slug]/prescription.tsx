import type { NextPageWithLayout } from "../../_app";
import { withPageAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
import Layout from "../../../components/layout";
import { ReactElement, useState } from "react";
import Head from "next/head";
import { Flex } from "@chakra-ui/react";
import { getPracticeBySlug } from "../../api/practice/find/[slug]";
import moment from "moment";
import { components } from "../../../schemas/api-types";
import { useLoading } from "../../../components/state/loading";
import { useRouter } from "next/router";
import axios, { AxiosResponse } from "axios";
import { PrescriptionForm } from "../../../components/prescription/form";
type PracticeType = components["schemas"]["Practice"];
type PrescriptionType = components["schemas"]["Prescription"];
interface Props extends PracticeType {}

const RequestPrescriptionPage: NextPageWithLayout<Props> = (props) => {
  const { setLoading } = useLoading();
  const { replace } = useRouter();

  const submitBooking = async (
    data: PrescriptionType,
    practiceSlug: string,
  ) => {
    setLoading(true);
    const url = `/api/prescription/practice/${practiceSlug}/create`;
    const createPractice: Promise<AxiosResponse<PrescriptionType>> = axios.post(
      url,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const result = await createPractice;
    const id = result.data.id;
    setLoading(false);
    replace(`/prescriptions`);
  };

  return (
    <Flex>
      <PrescriptionForm
        practiceName={props.name}
        practiceSlug={props.slug || ""}
        onSubmit={(d) => {
          submitBooking(d, props.slug || "");
        }}
      />
    </Flex>
  );
};

RequestPrescriptionPage.getLayout = (page: ReactElement) => {
  return (
    <>
      <Head>
        <title>Request Prescription</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (ctx) => {
    const slug = ctx.query.slug as string;
    let token: string = "";
    try {
      const { accessToken } = await getAccessToken(ctx.req, ctx.res);
      token = accessToken as string;
    } catch (e) {
      return {
        redirect: {
          destination: `/api/auth/login?returnTo=/practice/${slug}/prescription`,
          permanent: false,
        },
      };
    }

    const { data } = await getPracticeBySlug(slug);
    if (!data.id) {
      return {
        notFound: true,
      };
    }
    const pageTitle = data.name;
    return {
      props: {
        ...data,
        opening_time_exceptions: data.opening_time_exceptions
          ? data.opening_time_exceptions.map((e: any) => {
              return {
                ...e,
                start_datetime: moment(e.start_datetime).format("DD/MM/YYYY"),
                end_datetime: moment(e.end_datetime).format("DD/MM/YYYY"),
              };
            })
          : [],
        pageTitle,
      },
    };
  },
});

export default RequestPrescriptionPage;
