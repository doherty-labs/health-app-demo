import type { NextPageWithLayout } from "../../_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../../../components/layout";
import { ReactElement, useState } from "react";
import moment from "moment";
import { getStaff } from "../../api/staff/manage";
import { components } from "../../../schemas/api-types";
import { getPractice } from "../../api/practice/[id]/manage";
import Head from "next/head";
import { CalendarComponent } from "../../../components/calendar/calendar";
import axios from "axios";
import { useLoading } from "../../../state/loading";
import { useToast } from "@chakra-ui/react";
import { getAllAvailability } from "../../api/availability/list/[practice_id]/[team_member_id]";
import _ from "lodash";
import { useTeamAvailability } from "../../../components/hooks/team-availability";
import { usePracticeAvailabilityEvents } from "../../../components/hooks/practice-availability";
import { withPageToken } from "../../../components/auth0-utils";
type PracticeType = components["schemas"]["Practice"];
type TeamMemberType = components["schemas"]["Practice"]["team_members"][0];
type AvailabilityType = components["schemas"]["Availability"];

interface ResProps {
  practice: PracticeType | undefined;
  pageTitle: string;
  teamMember: TeamMemberType | undefined;
  availability: AvailabilityType[];
}

const TeamAvailabilityPage: NextPageWithLayout<ResProps> = ({
  pageTitle,
  teamMember,
  practice,
}) => {
  const { setLoading } = useLoading();
  const toast = useToast();
  const addAvailability = async (avail: AvailabilityType) => {
    const { data } = await axios.post<AvailabilityType>(
      `/api/availability/create`,
      avail,
    );
    return data;
  };
  const updateAvailability = async (avail: AvailabilityType) => {
    const { data } = await axios.put<AvailabilityType>(
      `/api/availability/${avail.id}/manage`,
      avail,
    );
    return data;
  };
  const [endDate, setEndDate] = useState<Date>(
    moment().add(1, "month").toDate(),
  );
  const [startDate, setStartDate] = useState<Date>(
    moment().subtract(1, "month").toDate(),
  );

  const { events, manuallyRefresh } = useTeamAvailability({
    endDate: endDate,
    startDate: startDate,
    practiceId: practice?.id as number,
    teamId: teamMember?.id as number,
  });

  usePracticeAvailabilityEvents({
    practiceId: practice?.id,
    updateCallback: (a) => {
      manuallyRefresh();
    },
  });

  return (
    <>
      <CalendarComponent
        pageTitle={pageTitle}
        events={events || []}
        onEventClick={(e) => {
          console.log(e);
        }}
        onEventCreate={async (e) => {
          const target_date = moment(e.target_date, "DD/MM/YYYY");
          const start_time = target_date.clone().set({
            hour: Number(e.start_time.split(":")[0]),
            minute: Number(e.start_time.split(":")[1]),
          });

          const end_time = target_date.clone().set({
            hour: Number(e.end_time.split(":")[0]),
            minute: Number(e.end_time.split(":")[1]),
          });

          const schedule_release_time = start_time
            .clone()
            .subtract(e.schedule_release_time_delta, "seconds");
          const availability: AvailabilityType = {
            start_time: start_time.toDate().toISOString(),
            end_time: end_time.toDate().toISOString(),
            schedule_release_time: schedule_release_time.toDate().toISOString(),
            team_member_id: teamMember?.id as number,
            id: e.id,
          };
          setLoading(true);
          try {
            if (availability.id) {
              await updateAvailability(availability);
              toast({
                title: "Slot updated",
                description: "Slot has been updated.",
                status: "success",
                duration: 9000,
                isClosable: true,
              });
            } else {
              await addAvailability(availability);
              toast({
                title: "Slot added",
                description: "Slot has been added to the calendar.",
                status: "success",
                duration: 9000,
                isClosable: true,
              });
            }
            manuallyRefresh();
            setLoading(false);
          } catch (e) {
            setLoading(false);
            toast({
              title: "Error",
              description: "There was an error adding the slot.",
              status: "error",
              duration: 9000,
              isClosable: true,
            });
          }
        }}
      />
    </>
  );
};

TeamAvailabilityPage.getLayout = function getLayout(
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
    const id = Number(ctx.query.id as string);
    const { data: user } = await getStaff(token);
    if (token && user) {
      const { data } = await getPractice(user.practice_id, token);
      const teamMember = data.team_members.find(
        (member: TeamMemberType) => member.id === id,
      );

      if (!data.id || !teamMember) {
        return {
          notFound: true,
        };
      }

      const { data: availability } = await getAllAvailability(
        token,
        `start_date=${moment()
          .subtract(1, "month")
          .format("YYYY-MM-DD")}&end_date=${moment()
          .add(1, "month")
          .format("YYYY-MM-DD")}`,
        data.id,
        teamMember.id,
      );

      const pageTitle = `${teamMember.first_name} ${teamMember.last_name} - Availability`;
      return {
        props: {
          practice: data,
          pageTitle,
          teamMember,
          availability: availability.results,
        },
      };
    }
    return {
      props: { practice: {} },
    };
  }),
});

export default TeamAvailabilityPage;
