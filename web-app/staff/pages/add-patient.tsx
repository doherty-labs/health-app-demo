import { ReactElement } from "react";
import Layout from "../components/layout";
import type { NextPageWithLayout } from "./_app";
import Head from "next/head";
import {
  Box,
  Container,
  Stack,
  StackDivider,
  Text,
  Heading,
} from "@chakra-ui/react";
import { PersonInfoForm } from "../components/patient/form";
import { components } from "../schemas/api-types";
import axios from "axios";
import { useLoading } from "../state/loading";
import { useRouter } from "next/router";
type PatientType = components["schemas"]["Patient"];

const AddPatientPage: NextPageWithLayout = () => {
  const { setLoading } = useLoading();
  const { push } = useRouter();
  const submitPatient = async (patient: PatientType) => {
    const { data } = await axios.post<PatientType>(
      `/api/staff/patient/create`,
      patient,
    );
    return data;
  };

  return (
    <Container py={{ base: "4", md: "8" }}>
      <Stack spacing="5" divider={<StackDivider />}>
        <Stack spacing={1}>
          <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
            Invite Patient
          </Heading>
          <Text color="fg.muted">Invite a patient to GPBase.</Text>
        </Stack>
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
            onSubmit={async (d) => {
              setLoading(true);
              await submitPatient(d);
              setLoading(false);
              push("/appointments");
            }}
          />
        </Stack>
      </Stack>
    </Container>
  );
};

AddPatientPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Invite Patient</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export default AddPatientPage;
