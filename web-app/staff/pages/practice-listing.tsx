import type { NextPageWithLayout } from "./_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement } from "react";
import axios, { AxiosResponse } from "axios";
import { components } from "../schemas/api-types";
import moment from "moment";
import Head from "next/head";
import { useLoading } from "../state/loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
} from "@chakra-ui/react";
import { getPractice } from "./api/practice/[id]/manage";
import { PracticeFormScreen } from "../components/practice/practice";
import { getStaff } from "./api/staff/manage";
import { withPageToken } from "../components/auth0-utils";

type PracticeType = components["schemas"]["Practice"];
interface Props extends PracticeType {
  pageTitle: string;
}
const AddPracticePage: NextPageWithLayout<Props> = (props) => {
  const { setLoading } = useLoading();

  const submitData = async (body: PracticeType) => {
    const url = `/api/practice/${props.id}/manage`;
    const createPractice: Promise<AxiosResponse<PracticeType>> = axios.put(
      url,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    await createPractice;
    setLoading(false);
  };

  const inviteUser = async (email: string, practiceId: number) => {
    setLoading(true);
    const url = `/api/practice/${practiceId}/invite`;
    const searchPractice: Promise<AxiosResponse> = axios.post(
      url,
      {
        email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    await searchPractice;
    setLoading(false);
  };

  return (
    <>
      <Flex
        px={{
          base: 4,
          md: 8,
        }}
        pt={8}
      >
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{props.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Flex>

      <PracticeFormScreen
        inviteUser={(e) => {
          inviteUser(e, props.id || 0);
        }}
        defaultValues={props}
        onSubmit={(data) => {
          setLoading(true);
          submitData(data);
        }}
      />
    </>
  );
};

AddPracticePage.getLayout = function getLayout(page: ReactElement, props: any) {
  return (
    <>
      <Head>
        <title>{props.pageTitle}</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const { data: user } = await getStaff(token);
    if (token && user) {
      const { data } = await getPractice(user.practice_id, token);

      if (!data.id) {
        return {
          notFound: true,
        };
      }
      const pageTitle = `Manage Practice: ${data.name}`;
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
    }
    return {
      props: {},
    };
  }),
});

export default AddPracticePage;
