import type { NextPageWithLayout } from "../_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../../components/layout";
import { ReactElement, useState } from "react";
import { components } from "../../schemas/api-types";
import axios, { AxiosResponse } from "axios";
import { useLoading } from "../../state/loading";
import { useSearchUser } from "../../components/assign-user/search-user";
import { useSearchLoading } from "../../state/search";
import Head from "next/head";
import { useRouter } from "next/router";
import { PrescriptionDetailsComponent } from "../../components/prescription/details";
import { getPrescriptionStates } from "../api/states/prescription";
import { getPrescription } from "../api/prescription/[id]";
import { withPageToken } from "../../components/auth0-utils";
type PrescriptionType = components["schemas"]["Prescription"];
type StaffApiType = components["schemas"]["StaffMember"];
type StatesType = components["schemas"]["States"]["states"][0];
interface ResProps {
  prescriptionInit: PrescriptionType;
  states: StatesType[];
}

const PrescriptionGetPage: NextPageWithLayout<ResProps> = ({
  prescriptionInit,
  states,
}) => {
  const { setLoading } = useLoading();
  const { push } = useRouter();
  const [prescrip, setPrescription] =
    useState<PrescriptionType>(prescriptionInit);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { staffMembers } = useSearchUser({ term: searchTerm });
  const { actions } = useSearchLoading();

  const updateAppointment = async (prescription: PrescriptionType) => {
    const { data } = await axios.put<PrescriptionType>(
      `/api/prescription/${prescription.id}`,
      prescription,
    );
    return data;
  };

  const getPrescription = async (prescription: PrescriptionType) => {
    const { data } = await axios.get<PrescriptionType>(
      `/api/prescription/${prescription.id}`,
    );
    return data;
  };

  const addComment = async (comment: string) => {
    setLoading(true);
    await updateAppointment({
      ...prescrip,
      comments: [
        ...(prescrip.comments || []),
        {
          comment: comment,
          prescription_id: prescrip.id || 0,
        },
      ],
    });
    const data = await getPrescription(prescrip);
    setPrescription(data);
    setLoading(false);
  };

  const assignUser = async (staffMember: StaffApiType) => {
    actions.setLoading(true);
    await updateAppointment({
      ...prescrip,
      assigned_to_id: staffMember.id,
    });
    const data = await getPrescription(prescrip);
    setPrescription(data);
    actions.setLoading(false);
  };

  const unassignUser = async () => {
    actions.setLoading(true);
    await updateAppointment({
      ...prescrip,
      assigned_to_id: undefined,
    });
    const data = await getPrescription(prescrip);
    setPrescription(data);
    actions.setLoading(false);
  };

  const getDownloadPatientFileUrl = async (id: number) => {
    const url = `/api/patient/document/${id}`;
    const createPractice: Promise<AxiosResponse> = axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await createPractice;
    const downloadUrl = result.data;
    return downloadUrl;
  };

  const changeAptState = async (stateId: string) => {
    setLoading(true);
    await updateAppointment({
      ...prescrip,
      state: stateId,
    });
    const data = await getPrescription(prescrip);
    setPrescription(data);
    setLoading(false);
  };

  return (
    <PrescriptionDetailsComponent
      prescription={prescrip}
      states={states}
      onChangeState={async (state) => {
        changeAptState(state);
      }}
      onSubmitComment={(c) => {
        addComment(c);
      }}
      onDownloadPatientFile={async (id) => {
        setLoading(true);
        const downloadUrl = await getDownloadPatientFileUrl(id);
        push(downloadUrl);
        setLoading(false);
      }}
      assignUserProps={{
        onAssignUser: (u) => {
          assignUser(u);
        },
        onSearch: (t) => {
          setSearchTerm(t);
        },
        onClearAssignedUser: () => {
          unassignUser();
        },
        staffMembers: staffMembers,
        assignedUser: prescrip.assigned_to
          ? {
              ...prescrip.assigned_to,
              job_title: "",
              first_name: prescrip.assigned_to?.first_name || "",
              last_name: prescrip.assigned_to?.last_name || "",
              email: prescrip.assigned_to?.email || "",
              full_name: `${prescrip.assigned_to?.first_name} ${prescrip.assigned_to?.last_name}`,
            }
          : undefined,
      }}
    />
  );
};

PrescriptionGetPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Manage Prescription</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const id = ctx.query.id as string;
    const { request, data } = await getPrescription(id, token);
    const { data: statesData } = await getPrescriptionStates(token);

    if (request.status === 404) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        prescriptionInit: data,
        states: statesData.states,
      },
    };
  }),
});

export default PrescriptionGetPage;
