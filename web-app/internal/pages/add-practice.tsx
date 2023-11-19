import type { NextPageWithLayout } from "./_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement } from "react";
import { PracticeFormScreen } from "../components/form/practice";
import axios, { AxiosResponse } from "axios";
import { components } from "../schemas/api-types";
import { useRouter } from "next/router";
import Head from "next/head";
import { useLoading } from "../state/loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
} from "@chakra-ui/react";

type PracticeType = components["schemas"]["Practice"];
const AddPracticePage: NextPageWithLayout = () => {
  const { push } = useRouter();
  const { setLoading } = useLoading();
  const submitData = async (body: PracticeType) => {
    const url = "/api/practice/create";
    setLoading(true);
    const createPractice: Promise<AxiosResponse<PracticeType>> = axios.post(
      url,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const result = await createPractice;
    const id = result.data.id;
    setLoading(false);
    if (id) push(`/practice`);
  };
  return (
    <div>
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
            <BreadcrumbLink>Add Practice</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Flex>
      <PracticeFormScreen
        onSubmit={(data) => {
          submitData(data);
        }}
      />
    </div>
  );
};

AddPracticePage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Add Practice</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired();

export default AddPracticePage;
