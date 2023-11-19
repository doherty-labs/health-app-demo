import type { NextPageWithLayout } from "../../_app";
import { withPageAuthRequired, getAccessToken } from "@auth0/nextjs-auth0";
import Layout from "../../../components/layout";
import { ReactElement, useEffect, useState } from "react";
import Head from "next/head";
import { Flex, useToast } from "@chakra-ui/react";
import { components } from "../../../schemas/api-types";
import {
  useFileProgressPatientId,
  useLoading,
} from "../../../components/state/loading";
import { useRouter } from "next/router";
import { getAppointmentById } from "../../api/appointment/[id]";
import { AptCard } from "../../../components/book-apt/apt-card";
import axios, { AxiosResponse } from "axios";
type BookingType = components["schemas"]["Appointment"];
interface Props extends BookingType {}

const AptUploadPage: NextPageWithLayout<Props> = (props) => {
  const { setLoading } = useLoading();
  const { push, replace } = useRouter();
  const { actions: idActions } = useFileProgressPatientId();
  const toast = useToast();
  const [idFileUpload, setIdFileUpload] = useState<File>();

  const getUploadUrl = async (id: number, ext: string) => {
    const url = `/api/appointment/${id}/upload/${ext}`;
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
    const url = `/api/appointment/doc/${id}/download`;
    const createPractice: Promise<AxiosResponse> = axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await createPractice;
    const downloadUrl = result.data;
    return downloadUrl;
  };

  useEffect(() => {
    if (idFileUpload) {
      const performUpload = async () => {
        idActions.setLoading(true);
        const ext = idFileUpload.name.split(".").pop() || "";
        const url = await getUploadUrl(props.id || 0, ext);
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
          title: "File Uploaded",
          description: "We've received your file, this will be reviewed.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      };

      performUpload();
    }
  }, [idFileUpload, idActions, toast, replace, props.id]);

  return (
    <Flex>
      <AptCard
        {...props}
        uploadCard={{
          onDelete: async () => {},
          onDownload: async (id) => {
            setLoading(true);
            const downloadUrl = await getDownloadUrl(id);
            push(downloadUrl);
            setLoading(false);
          },
          onSubmitId: async (idFileUpload) => {
            setIdFileUpload(idFileUpload);
          },
          docs: props.documents,
        }}
      />
    </Flex>
  );
};

AptUploadPage.getLayout = function getLayout(page: ReactElement, props: any) {
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
  getServerSideProps: async (ctx) => {
    const id = ctx.query.id as string;
    let token: string = "";
    try {
      const { accessToken } = await getAccessToken(ctx.req, ctx.res);
      token = accessToken as string;
    } catch (e) {
      return {
        redirect: {
          destination: `/api/auth/login?returnTo=/appointment/${id}/upload`,
          permanent: false,
        },
      };
    }

    const { data } = await getAppointmentById(id, token);
    if (!data.id) {
      return {
        notFound: true,
      };
    }
    const pageTitle = "Appointment: Upload Files";
    return {
      props: {
        ...data,
        pageTitle,
      },
    };
  },
});

export default AptUploadPage;
