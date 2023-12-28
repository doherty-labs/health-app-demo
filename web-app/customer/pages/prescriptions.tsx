import type { NextPageWithLayout } from "./_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement, useEffect, useState } from "react";
import Head from "next/head";
import { components } from "../schemas/api-types";
import { getPrescriptions } from "./api/prescription/all";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Center,
  Container,
  Divider,
  HStack,
  Heading,
  List,
  ListItem,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import _ from "lodash";
import { withPageToken } from "../components/auth0-utils";

type PrescriptionType = components["schemas"]["Prescription"];

interface ResProps {
  prescriptions: PrescriptionType[];
}

const PrescriptionsPage: NextPageWithLayout<ResProps> = ({ prescriptions }) => {
  const [prescriptionList, setPrescriptionList] =
    useState<PrescriptionType[]>(prescriptions);
  useEffect(() => {
    const newList = _.chain(prescriptions)
      .map((prescription) => {
        const items = _.chain(prescription.items)
          .map((item) => {
            return {
              ...item,
              created_at: moment(item.created_at).format("lll"),
              updated_at: moment(item.updated_at).format("lll"),
            };
          })
          .value();
        return {
          ...prescription,
          items,
          created_at: moment(prescription.created_at).format("lll"),
          updated_at: moment(prescription.updated_at).format("lll"),
        };
      })
      .value();
    setPrescriptionList(newList);
  }, [prescriptions]);

  return (
    <Stack divider={<Divider />}>
      <Container pt={{ base: "4", md: "8" }} pb={{ base: "6", md: "6" }}>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Prescriptions</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Stack
          spacing="4"
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          pt={4}
        >
          <Stack spacing="1">
            <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
              Prescriptions
            </Heading>
            <Text color="fg.muted">
              View previous prescriptions and their status.
            </Text>
          </Stack>
        </Stack>
      </Container>
      {prescriptionList.length > 0 ? (
        <Center pt={4}>
          <List listStyleType="none" maxW={"xl"} w={"100%"} spacing={4}>
            {prescriptionList.map((scipts) => (
              <ListItem
                key={scipts.id}
                value={scipts.id}
                bg="bg-surface"
                p="4"
                boxShadow="sm"
                position="relative"
                borderRadius="lg"
                w={"100%"}
              >
                <Stack shouldWrapChildren spacing="4">
                  <Text
                    textStyle="sm"
                    fontWeight="medium"
                    color="fg-emphasized"
                  >
                    {scipts.pharmacy.name}
                  </Text>
                  <Stack divider={<Divider />}>
                    {scipts.items.map((item) => {
                      return (
                        <Stack key={item.id}>
                          <Text textStyle="sm" color={"muted"}>
                            Name: {item.name}
                          </Text>
                          <Text textStyle="sm" color={"muted"}>
                            Quantity: {item.quantity}
                          </Text>
                        </Stack>
                      );
                    })}
                  </Stack>
                  <HStack justify="space-between">
                    <Badge colorScheme={"green"} size="sm">
                      {scipts.state}
                    </Badge>
                    <Text textStyle="sm" color={"muted"}>
                      Last Updated:
                      {scipts.updated_at}
                    </Text>
                  </HStack>
                </Stack>
              </ListItem>
            ))}
          </List>
        </Center>
      ) : (
        <Center pt={4} hidden={prescriptionList.length !== 0}>
          <Text textStyle="sm" color={"muted"}>
            No prescriptions have been made.
          </Text>
        </Center>
      )}
    </Stack>
  );
};

PrescriptionsPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Prescriptions</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const { data, request } = await getPrescriptions("page=1", token);

    if (request.status !== 200) {
      return {
        props: {
          prescriptions: [],
        },
      };
    }

    return {
      props: {
        prescriptions: data.results,
      },
    };
  }),
});

export default PrescriptionsPage;
