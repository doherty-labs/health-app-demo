import type { NextPageWithLayout } from "./_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement } from "react";
import moment from "moment";
import { getStaff } from "./api/staff/manage";
import { components } from "../schemas/api-types";
import { getPractice } from "./api/practice/[id]/manage";
import { SelectTeamMember } from "../components/team/select-team";
import Head from "next/head";
import { withPageToken } from "../components/auth0-utils";
type PracticeType = components["schemas"]["Practice"];

interface ResProps {
  practice: PracticeType | undefined;
}

const AvailabilityPage: NextPageWithLayout<ResProps> = ({ practice }) => {
  return (
    <>
      {practice && practice.id ? (
        <SelectTeamMember practice={practice} />
      ) : null}
    </>
  );
};

AvailabilityPage.getLayout = function getLayout(
  page: ReactElement,
  props: any,
) {
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
      const pageTitle = `Manage Availability - ${data.name}`;
      return {
        props: {
          practice: {
            ...data,
            opening_time_exceptions: data.opening_time_exceptions
              ? data.opening_time_exceptions.map((e: any) => {
                  return {
                    ...e,
                    start_datetime: moment(e.start_datetime).format(
                      "DD/MM/YYYY",
                    ),
                    end_datetime: moment(e.end_datetime).format("DD/MM/YYYY"),
                  };
                })
              : [],
          },
          pageTitle,
        },
      };
    }
    return {
      props: { practice: {} },
    };
  }),
});

export default AvailabilityPage;
