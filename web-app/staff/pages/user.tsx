import type { NextPageWithLayout } from "./_app";
import {
  withPageAuthRequired,
  getSession,
  getAccessToken,
} from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement, useState } from "react";
import { Box, Container, Stack, StackDivider, Text } from "@chakra-ui/react";
import { UserInfoForm } from "../components/user/user";
import { components } from "../schemas/api-types";
import axios, { AxiosResponse } from "axios";

import Head from "next/head";
import { useLoading } from "../state/loading";
import { getStaff } from "./api/staff/manage";

export type StaffApiType = components["schemas"]["StaffMember"];
interface UserInfoPageProps {
  userEmail: string;
  existingStaff: StaffApiType | null;
}

const UserInfoPage: NextPageWithLayout<UserInfoPageProps> = (props) => {
  const { setLoading } = useLoading();
  const [user, setUser] = useState<StaffApiType | null>(props.existingStaff);
  const submitData = async (body: StaffApiType) => {
    setLoading(true);
    const url = `/api/staff/manage`;
    const createPractice: Promise<AxiosResponse<StaffApiType>> = axios.post(
      url,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    await createPractice;
    await getUserData();
    setLoading(false);
  };

  const updateData = async (body: StaffApiType) => {
    setLoading(true);
    const url = `/api/staff/manage`;
    const createPractice: Promise<AxiosResponse<StaffApiType>> = axios.put(
      url,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    await createPractice;
    await getUserData();
    setLoading(false);
  };

  const getUserData = async () => {
    const url = `/api/staff/manage`;
    const createPractice: Promise<AxiosResponse<StaffApiType>> = axios.get(
      url,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const { data } = await createPractice;
    setUser(data);
  };

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
              Account Information
            </Text>
            <Text color="muted" fontSize="sm">
              Your account details.
            </Text>
          </Box>
          <UserInfoForm
            onSubmit={(d) => {
              if (user === null) {
                submitData(d);
              } else {
                updateData(d);
              }
            }}
            defaultValues={{
              email: props.userEmail,
              first_name: user?.first_name || "",
              last_name: user?.last_name || "",
              bio: user?.bio || "",
              job_title: user?.job_title || "",
            }}
          />
        </Stack>
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
          destination: `/api/auth/login?returnTo=/user`,
          permanent: false,
        },
      };
    }

    const sesh = await getSession(ctx.req, ctx.res);
    const { data, request } = await getStaff(sesh?.accessToken as string);
    return {
      props: {
        userEmail: sesh?.user.email,
        existingStaff: request.status === 200 ? data : null,
      },
    };
  },
});

export default UserInfoPage;
