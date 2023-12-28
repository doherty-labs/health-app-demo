import type { NextPageWithLayout } from "./_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { components } from "../schemas/api-types";
import { getAppointmentStates } from "./api/states/appointment";
import { useUserProps } from "../state/user";
import axios, { CanceledError } from "axios";
import { AppointmentKanbanBoard } from "../components/kanban/apt-board";
import _ from "lodash";
import { useKanbanLoading, useLoading } from "../state/loading";
import { useRouter } from "next/router";
import { withPageToken } from "../components/auth0-utils";

type StatesType = components["schemas"]["States"];
type AppointmentType = components["schemas"]["Appointment"];

interface PaginationAppointment {
  results: AppointmentType[];
  count: number | undefined;
  next: string;
  previous: string;
}

interface AppointmentByLane {
  state: StatesType["states"][0];
  data: PaginationAppointment;
}

interface ResProps {
  states: StatesType;
}

interface GetSwimLaneProps {
  practice_id: number;
  state: string;
  pageNumber: string;
  search: string;
  abort?: AbortController;
}

const AppointmentsGetPage: NextPageWithLayout<ResProps> = ({ states }) => {
  const { practice } = useUserProps();
  const { setLoading } = useLoading();
  const [appointments, setAppointments] = useState<AppointmentByLane[]>();
  const { actions } = useKanbanLoading();
  const { push } = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const getSwimLane = async ({
    practice_id,
    state,
    pageNumber,
    search,
    abort,
  }: GetSwimLaneProps) => {
    const params = new URLSearchParams();
    if (search) {
      params.append("name", search);
    }
    if (pageNumber) {
      params.append("page", pageNumber);
    }
    let url = `/api/practice/${practice_id}/appointments/state/${state}?${params.toString()}`;
    const { data } = await axios.get<PaginationAppointment>(url, {
      signal: abort ? abort.signal : undefined,
    });
    return data;
  };

  const updateAppointment = async (appointment: AppointmentType) => {
    const { data } = await axios.put<AppointmentType>(
      `/api/appointment/${appointment.id}`,
      appointment,
    );
    return data;
  };

  const getAllData = useCallback(
    async (abort?: AbortController) => {
      const promises = states.states.map((state) => {
        if (practice && practice.id)
          return getSwimLane({
            practice_id: practice.id,
            state: state.id,
            pageNumber: "1",
            search: searchTerm,
            abort,
          });
      });
      const data = await Promise.all(promises);
      const appointmentsByLanes = states.states.map((state, index) => {
        return {
          state,
          data: data[index] as PaginationAppointment,
        };
      });
      setAppointments(appointmentsByLanes);
    },
    [practice, states, searchTerm],
  );

  useEffect(() => {
    actions.setStates(states.states);
  }, [actions, states.states]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const req = async () => {
      try {
        await getAllData(controller);
        setLoading(false);
      } catch (e) {
        if (e instanceof CanceledError) {
          return;
        } else {
          setLoading(false);
        }
      }
    };
    req();
    return () => {
      setLoading(false);
      controller.abort();
    };
  }, [getAllData, searchTerm, setLoading]);

  return (
    <AppointmentKanbanBoard
      lanes={states.states}
      appointmentsByLanes={_.chain(appointments)
        .map((apt) => {
          return {
            lane: apt.state,
            appointments: apt.data ? apt.data.results : [],
            count: apt.data ? apt.data.count : 0,
            next: apt.data ? apt.data.next : "",
            previous: apt.data ? apt.data.previous : "",
          };
        })
        .value()}
      onDropEvent={async (apt, lane) => {
        if (practice && practice.id) {
          setLoading(true);
          const newApt = {
            ...apt,
            state: lane.id,
          };
          await updateAppointment(newApt);
          await getAllData();
          setLoading(false);
        }
      }}
      onClickEvent={(apt) => {
        push(`/appointment/${apt.id}`);
      }}
      onSearchEvent={(term) => {
        setSearchTerm(term);
      }}
      onNextPageEvent={async (lane) => {
        if (practice && practice.id) {
          const apt = _.chain(appointments)
            .filter((apt) => {
              return apt.state.id === lane.id;
            })
            .value()[0];
          const tempURL = new URLSearchParams(apt.data.next);
          if (!apt.data.next) return;
          actions.setLoading(true, lane);
          const next = tempURL.get("page") || "";
          const result = await getSwimLane({
            practice_id: practice.id,
            state: lane.id,
            pageNumber: next,
            search: searchTerm,
          });
          setAppointments((prev) => {
            const newAppointments = _.chain(prev)
              .map((apt) => {
                if (apt.state.id === lane.id) {
                  return {
                    ...apt,
                    data: {
                      ...result,
                      results: [...apt.data.results, ...result.results],
                    },
                  };
                }
                return apt;
              })
              .value();
            return newAppointments;
          });
          actions.setLoading(false, lane);
        }
      }}
    />
  );
};

AppointmentsGetPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout excludeContainer={true}>{page}</Layout>;
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const { data, request } = await getAppointmentStates(token);

    if (request.status !== 200) {
      return {
        props: {
          states: {
            states: [],
          },
        },
      };
    }

    return {
      props: {
        states: data,
      },
    };
  }),
});

export default AppointmentsGetPage;
