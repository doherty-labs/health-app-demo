import type { NextPageWithLayout } from "./_app";
import {
  withPageAuthRequired,
  getSession,
  getAccessToken,
} from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement, useEffect, useState } from "react";
import {
  Box,
  Container,
  Stack,
  StackDivider,
  Text,
  useToast,
} from "@chakra-ui/react";
import { PersonInfoForm } from "../components/user/address";
import { ProfileCard } from "../components/user/profile";
import { components } from "../schemas/api-types";
import axios, { AxiosResponse } from "axios";
import {
  useFileProgressPatientId,
  useFileProgressPatientPoa,
  useLoading,
} from "../components/state/loading";
import { getPatient } from "./api/patient/manage";
import moment from "moment";
import Head from "next/head";
import { useRouter } from "next/router";
export type PatientApiType = components["schemas"]["Patient"];
interface UserInfoPageProps {
  userEmail: string;
  existingPatientInit: PatientApiType | null;
}

const UserInfoPage: NextPageWithLayout<UserInfoPageProps> = (props) => {
  const { setLoading } = useLoading();
  const { push, replace } = useRouter();
  const [idFileUpload, setIdFileUpload] = useState<File>();
  const [poaFileUpload, setPoaFileUpload] = useState<File>();
  const { actions: idActions } = useFileProgressPatientId();
  const { actions: poaActions } = useFileProgressPatientPoa();
  const [existingPatient, setExistingPatient] = useState<PatientApiType | null>(
    props.existingPatientInit,
  );
  const toast = useToast();

  const submitData = async (body: PatientApiType) => {
    setLoading(true);
    const url = `/api/patient/manage`;
    const createPractice: Promise<AxiosResponse<PatientApiType>> = axios.post(
      url,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const { data } = await createPractice;
    setExistingPatient(data);
    setLoading(false);
  };

  const updateData = async (body: PatientApiType) => {
    setLoading(true);
    const url = `/api/patient/manage`;
    const createPractice: Promise<AxiosResponse<PatientApiType>> = axios.put(
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

  const getIdUploadUrl = async (ext: string) => {
    const url = `/api/patient/upload/id/${ext}`;
    const createPractice: Promise<AxiosResponse> = axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await createPractice;
    const uploadUrl = result.data;
    return uploadUrl;
  };

  const getPoaUploadUrl = async (ext: string) => {
    const url = `/api/patient/upload/poa/${ext}`;
    const createPractice: Promise<AxiosResponse> = axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await createPractice;
    const uploadUrl = result.data;
    return uploadUrl;
  };

  const getDownloadUrl = async (id: number) => {
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

  const deletePatientDocument = async (id: number) => {
    const url = `/api/patient/document/${id}`;
    const createPractice: Promise<AxiosResponse> = axios.delete(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    await createPractice;
  };

  useEffect(() => {
    if (idFileUpload) {
      const performUpload = async () => {
        idActions.setLoading(true);
        const ext = idFileUpload.name.split(".").pop() || "";
        const url = await getIdUploadUrl(ext);
        await axios.put(url, idFileUpload, {
          headers: {
            "Content-Type": idFileUpload.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              idActions.setProgress(percentCompleted);
            }
          },
        });
        idActions.setLoading(false);
        idActions.setCompleted(true);
        toast({
          title: "ID Uploaded",
          description: "We've received your document, this will be reviewed.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        replace("/user");
      };

      performUpload();
    }
  }, [idFileUpload, idActions, toast, replace]);

  useEffect(() => {
    if (poaFileUpload) {
      const performUpload = async () => {
        poaActions.setLoading(true);
        const ext = poaFileUpload.name.split(".").pop() || "";
        const url = await getPoaUploadUrl(ext);
        await axios.put(url, poaFileUpload, {
          headers: {
            "Content-Type": poaFileUpload.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              poaActions.setProgress(percentCompleted);
            }
          },
        });
        poaActions.setLoading(false);
        poaActions.setCompleted(true);
        toast({
          title: "Proof of Address Uploaded",
          description: "We've received your document, this will be reviewed.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        replace("/user");
      };
      performUpload();
    }
  }, [poaFileUpload, poaActions, toast, replace]);

  return (
    <Container py={{ base: "4", md: "8" }}>
      <Stack spacing="5" divider={<StackDivider />}>
        <Stack
          direction={{ base: "column", lg: "row" }}
          spacing={{ base: "5", lg: "8" }}
          justify="space-between"
        >
          <Box flexShrink={0}>
            <Text fontSize="lg" fontWeight="medium">
              Personal Information
            </Text>
            <Text color="muted" fontSize="sm">
              Your name, address and contact details.
            </Text>
          </Box>
          <PersonInfoForm
            onSubmit={(d) => {
              if (existingPatient === null) {
                submitData(d);
              } else {
                updateData(d);
              }
            }}
            defaultValues={
              existingPatient === null
                ? {
                    email: props.userEmail,
                    address_line_1: "",
                    address_line_2: "",
                    city: "",
                    state: "",
                    zip_code: "",
                    country: "",
                    first_name: "",
                    last_name: "",
                    full_name: "",
                    phone: "",
                    date_of_birth: "",
                    gender: "",
                    health_care_number: "",
                  }
                : existingPatient
            }
          />
        </Stack>
        {existingPatient ? (
          <Stack
            direction={{ base: "column", lg: "row" }}
            spacing={{ base: "5", lg: "8" }}
            justify="space-between"
          >
            <Box flexShrink={0}>
              <Text fontSize="lg" fontWeight="medium">
                Identity Verification
              </Text>
              <Text color="muted" fontSize="sm">
                Helps us verify who you are.
              </Text>
            </Box>
            <ProfileCard
              onSubmitId={(f) => setIdFileUpload(f)}
              onSubmitPoa={(f) => setPoaFileUpload(f)}
              docs={existingPatient?.documents || []}
              onDelete={async (id) => {
                setLoading(true);
                await deletePatientDocument(id);
                toast({
                  title: "File Deleted",
                  description: "Your file has been deleted.",
                  status: "success",
                  duration: 9000,
                  isClosable: true,
                });
                setLoading(false);
                replace("/user");
              }}
              onDownload={async (id) => {
                setLoading(true);
                const downloadUrl = await getDownloadUrl(id);
                push(downloadUrl);
                setLoading(false);
              }}
            />
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
};

UserInfoPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Account Settings</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (ctx) => {
    let token: string = "";
    try {
      const { accessToken } = await getAccessToken(ctx.req, ctx.res);
      token = accessToken as string;
    } catch (e) {
      return {
        redirect: {
          destination: "/api/auth/login?returnTo=/user",
          permanent: false,
        },
      };
    }
    const sesh = await getSession(ctx.req, ctx.res);
    const { data, request } = await getPatient(token);
    return {
      props: {
        userEmail: sesh?.user.email,
        existingPatientInit:
          request.status === 200
            ? {
                ...data,
                date_of_birth: data.date_of_birth
                  ? moment(data.date_of_birth).format("DD/MM/YYYY")
                  : "",
              }
            : null,
      },
    };
  },
});

export default UserInfoPage;
