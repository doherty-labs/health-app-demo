import type { NextPageWithLayout } from "./_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { components } from "../schemas/api-types";
import { useUserProps } from "../state/user";
import axios, { CanceledError } from "axios";
import _ from "lodash";
import { useKanbanLoading, useLoading } from "../state/loading";
import { useRouter } from "next/router";
import { getPrescriptionStates } from "./api/states/prescription";
import { PrescriptionKanbanBoard } from "../components/kanban/prescription-board";
import { withPageToken } from "../components/auth0-utils";

type StatesType = components["schemas"]["States"];
type PrescriptionType = components["schemas"]["Prescription"];

interface PaginationPrescription {
  results: PrescriptionType[];
  count: number | undefined;
  next: string;
  previous: string;
}

interface PrescriptionByLane {
  state: StatesType["states"][0];
  data: PaginationPrescription;
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

const PrescriptionsGetPage: NextPageWithLayout<ResProps> = ({ states }) => {
  const { practice } = useUserProps();
  const { setLoading } = useLoading();
  const [prescriptions, setPrescriptions] = useState<PrescriptionByLane[]>();
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
    let url = `/api/practice/${practice_id}/prescription/state/${state}?${params.toString()}`;
    const { data } = await axios.get<PaginationPrescription>(url, {
      signal: abort ? abort.signal : undefined,
    });
    return data;
  };

  const updatePrescription = async (prescription: PrescriptionType) => {
    const { data } = await axios.put<PrescriptionType>(
      `/api/prescription/${prescription.id}`,
      prescription,
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
      const prescriptionsByLanes = states.states.map((state, index) => {
        return {
          state,
          data: data[index] as PaginationPrescription,
        };
      });
      setPrescriptions(prescriptionsByLanes);
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
    <PrescriptionKanbanBoard
      lanes={states.states}
      prescriptionsByLanes={_.chain(prescriptions)
        .map((apt) => {
          return {
            lane: apt.state,
            prescriptions: apt.data ? apt.data.results : [],
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
          await updatePrescription(newApt);
          await getAllData();
          setLoading(false);
        }
      }}
      onClickEvent={(apt) => {
        push(`/prescription/${apt.id}`);
      }}
      onSearchEvent={(term) => {
        setSearchTerm(term);
      }}
      onNextPageEvent={async (lane) => {
        if (practice && practice.id) {
          const apt = _.chain(prescriptions)
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
          setPrescriptions((prev) => {
            const newPrescriptions = _.chain(prev)
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
            return newPrescriptions;
          });
          actions.setLoading(false, lane);
        }
      }}
    />
  );
};

PrescriptionsGetPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout excludeContainer={true}>{page}</Layout>;
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const { data, request } = await getPrescriptionStates(token);

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

export default PrescriptionsGetPage;
