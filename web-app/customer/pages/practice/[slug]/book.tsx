import type { NextPageWithLayout } from "../../_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../../../components/layout";
import { ReactElement } from "react";
import Head from "next/head";
import { Flex } from "@chakra-ui/react";
import { BookAptForm } from "../../../components/book-apt/book";
import { getPracticeBySlug } from "../../api/practice/find/[slug]";
import moment from "moment";
import { components } from "../../../schemas/api-types";
import { useLoading } from "../../../components/state/loading";
import { useRouter } from "next/router";
import axios, { AxiosResponse } from "axios";
import { withPageToken } from "../../../components/auth0-utils";
type PracticeType = components["schemas"]["Practice"];
type BookingType = components["schemas"]["Appointment"];
interface Props extends PracticeType {}

const BookAptPage: NextPageWithLayout<Props> = (props) => {
  const { setLoading } = useLoading();
  const { push } = useRouter();

  const submitBooking = async (data: BookingType, practiceSlug: string) => {
    setLoading(true);
    const url = `/api/appointment/practice/${practiceSlug}/create`;
    const createPractice: Promise<AxiosResponse<BookingType>> = axios.post(
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
    push(`/appointment/${id}/upload`);
  };

  return (
    <Flex>
      <BookAptForm
        practiceName={props.name}
        practiceSlug={props.slug || ""}
        onSubmit={(d) => {
          submitBooking(d, props.slug || "");
        }}
      />
    </Flex>
  );
};

BookAptPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Book Appointment</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const slug = ctx.query.slug as string;
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
  }),
});

export default BookAptPage;
