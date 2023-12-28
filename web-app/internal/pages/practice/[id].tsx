import type { NextPageWithLayout } from "../_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../../components/layout";
import { ReactElement } from "react";
import { PracticeFormScreen } from "../../components/form/practice";
import axios, { AxiosResponse } from "axios";
import { components } from "../../schemas/api-types";
import { useRouter } from "next/router";
import { getPractice } from "../api/practice/[id]/manage";
import moment from "moment";
import Head from "next/head";
import { useLoading } from "../../state/loading";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Container,
  Flex,
} from "@chakra-ui/react";
import { withPageToken } from "../../components/auth0-utils";

type PracticeType = components["schemas"]["Practice"];
interface Props extends PracticeType {
  pageTitle: string;
}
const AddPracticePage: NextPageWithLayout<Props> = (props) => {
  const { query, push } = useRouter();
  const { setLoading } = useLoading();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const submitData = async (body: PracticeType) => {
    const url = `/api/practice/${query.id}/manage`;
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
    push("/practice");
  };
  const deletePractice = async () => {
    setLoading(true);
    const url = `/api/practice/${query.id}/manage`;
    const deletePractice: Promise<AxiosResponse<PracticeType>> = axios.delete(
      url,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    await deletePractice;
    setLoading(false);
    push("/practice");
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this practice?</Text>
          </ModalBody>

          <ModalFooter>
            <Button variant={"outline"} mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={() => {
                onClose();
                deletePractice();
              }}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Flex
        px={{
          base: 4,
          md: 8,
        }}
        pt={4}
      >
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/practice">Practice</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{props.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Flex>

      <PracticeFormScreen
        discardCallback={() => {
          onOpen();
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
    const id = ctx.query.id;
    if (token && id) {
      const { data } = await getPractice(id as string, token);

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
