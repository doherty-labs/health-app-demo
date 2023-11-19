import Head from "next/head";
import { components } from "../../schemas/api-types";
import type { NextPageWithLayout } from "../_app";
import { ReactElement, useMemo } from "react";
import Layout from "../../components/layout";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  Stack,
  Text,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { getPracticeBySlug } from "../api/practice/find/[slug]";
import moment from "moment";
import { FiMapPin } from "react-icons/fi";
import {
  BusinessTimeRange,
  OpeningDayRowProps,
  SummaryTab,
} from "../../components/practice/summary";
import { chain } from "lodash";
import { TeamTab } from "../../components/practice/team";
import { NoticesTab } from "../../components/practice/notices";
import { useRouter } from "next/router";
import { useUserOnboarded } from "../../components/hooks/user-onboarded";
type PracticeType = components["schemas"]["Practice"];
interface Props extends PracticeType {
  pageTitle: string;
}

const PracticePage: NextPageWithLayout<Props> = (props) => {
  const { push } = useRouter();
  const { onboarded } = useUserOnboarded();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const aptFlag = props.feature_flags.find(
    (f) => f.flag_id === "appointment_request",
  )?.flag_value;
  const prescriptionFlag = props.feature_flags.find(
    (f) => f.flag_id === "prescription_request",
  )?.flag_value;

  useMemo(() => {
    if (onboarded === false) {
      onOpen();
    }
  }, [onboarded, onOpen]);

  return (
    <Flex
      pt={{ base: "4", md: "8" }}
      pb={{ base: "12", md: "24" }}
      direction={"column"}
      gap={"4"}
    >
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Registration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Please complete the registration process before booking an
              appointment.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                push(`/user`);
              }}
            >
              Complete Registration
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{props.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Box
        as="section"
        bg="bg-surface"
        boxShadow="sm"
        borderRadius="xl"
        pt={{ base: "4", md: "8" }}
        pb={{ base: "6", md: "6" }}
        w={"100%"}
      >
        <Container>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
          >
            <Stack
              spacing={{
                base: "1",
                md: "2",
              }}
              py="2"
              justify={{
                base: "center",
                md: "flex-start",
              }}
              align={{
                base: "center",
                md: "flex-start",
              }}
            >
              <Heading size={"xs"} fontWeight="medium">
                {props.name}
              </Heading>
              <HStack
                direction={"row"}
                gap={2}
                px={{
                  base: 4,
                  md: 0,
                }}
                maxW={{ base: "100%", md: "sm" }}
              >
                <Icon as={FiMapPin} boxSize={{ base: "4", sm: "5" }} />
                <Stack spacing={0}>
                  <Text color="muted">{props.address_line_1}</Text>
                  <Text color="muted">{props.address_line_2}</Text>
                  <Text color="muted">
                    {props.zip_code}, {props.city}, {props.state}
                  </Text>
                </Stack>
              </HStack>
            </Stack>
            <Stack
              direction={{ base: "column", sm: "column", md: "row" }}
              spacing={"3"}
              gap={"1"}
            >
              <Button
                order={{ base: "2", md: "1" }}
                variant="secondary"
                isDisabled={
                  props.org_id === null ||
                  onboarded === false ||
                  onboarded === undefined ||
                  prescriptionFlag === false
                }
                onClick={() => {
                  push(`/practice/${props.slug}/prescription`);
                }}
              >
                Request Prescription
              </Button>
              <Button
                order={{ base: "1", md: "2" }}
                variant="primary"
                isDisabled={
                  props.org_id === null ||
                  onboarded === false ||
                  onboarded === undefined ||
                  aptFlag === false
                }
                onClick={() => {
                  push(`/practice/${props.slug}/book`);
                }}
              >
                Book Appointment
              </Button>
            </Stack>
          </Stack>
          <Alert status="warning" mt={4} hidden={props.org_id !== null}>
            <AlertIcon />
            This practice has not yet joined GPBase.
          </Alert>
        </Container>
        <Box as="section" bg="bg-surface" pt={"3"}>
          <Container py={{ base: "4", md: "8" }}>
            <Stack spacing="16">
              <Tabs size={"lg"} variant="with-line">
                <TabList>
                  <Tab>Summary</Tab>
                  <Tab>Team</Tab>
                  <Tab>Notices</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel
                    p={{
                      base: "0",
                      md: "4",
                    }}
                    pt={{
                      base: "2",
                      md: "4",
                    }}
                  >
                    <SummaryTab
                      contactDetails={{
                        contactPoints: props.contact_options.map((c) => {
                          return {
                            name: c.name,
                            href: c.href_type,
                            displayValue: c.value,
                            id: c.id || 0,
                          };
                        }),
                      }}
                      openingHours={{
                        days: chain(props.opening_hours)
                          .groupBy("day_of_week")
                          .map((o: PracticeType["opening_hours"]) => {
                            const bh = chain(o)
                              .map((d) => {
                                const result: BusinessTimeRange = {
                                  endTime: d.end_time || "",
                                  startTime: d.start_time || "",
                                  hoursType: d.is_closed
                                    ? "closedAt"
                                    : "opensAt",
                                };
                                return result;
                              })
                              .value();
                            const result: OpeningDayRowProps = {
                              businessHours: bh,
                              dayNumber: o[0].day_of_week,
                              nameOfDay: moment()
                                .day(o[0].day_of_week)
                                .format("dddd"),
                            };
                            return result;
                          })
                          .sort((a, b) => {
                            if (a.dayNumber === 0) return -1;
                            if (b.dayNumber === 0) return -1;
                            if (a.dayNumber > b.dayNumber) {
                              return 1;
                            }
                            if (a.dayNumber < b.dayNumber) {
                              return -1;
                            }
                            return 0;
                          })
                          .value(),
                      }}
                      locationDetails={{
                        address: [
                          props.address_line_1,
                          props.address_line_2,
                          props.zip_code,
                          props.city,
                          props.country,
                        ].join(", "),
                        lat: props.latitude || 0,
                        lng: props.longitude || 0,
                      }}
                    />
                  </TabPanel>
                  <TabPanel
                    p={{
                      base: "0",
                      md: "4",
                    }}
                    pt={{
                      base: "2",
                      md: "4",
                    }}
                  >
                    <TeamTab
                      members={chain(props.team_members)
                        .map((t) => {
                          return {
                            name: t.first_name + " " + t.last_name,
                            role: t.job_title,
                            description: t.bio || "",
                          };
                        })
                        .value()}
                    />
                  </TabPanel>
                  <TabPanel
                    p={{
                      base: "0",
                      md: "4",
                    }}
                    pt={{
                      base: "2",
                      md: "4",
                    }}
                  >
                    <NoticesTab
                      notices={chain(props.notices)
                        .map((n) => {
                          return {
                            title: n.title,
                            content: n.description_markdown,
                            updatedAt: moment(n.created_at).format(
                              "DD/MM/YYYY",
                            ),
                          };
                        })
                        .value()}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Flex>
  );
};

PracticePage.getLayout = function getLayout(page: ReactElement, props: any) {
  return (
    <>
      <Head>
        <title>{props.pageTitle}</title>
        <meta
          name="description"
          content={`${props.pageTitle} - General Practice (GP), Book an Appointment or Request a Prescription`}
        />
        <meta
          name="keywords"
          content={`${props.pageTitle}, gp, practice, surgery, appointment, prescription, general practice}`}
        />

        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://gpbase.co.uk/practice/${props.slug}`}
        />
        <meta
          property="og:title"
          content={`${props.pageTitle} - General Practice (GP)`}
        />
        <meta
          property="og:description"
          content={`${props.pageTitle} - General Practice (GP), Book an Appointment or Request a Prescription`}
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content={`https://gpbase.co.uk/practice/${props.slug}`}
        />
        <meta
          property="twitter:title"
          content={`${props.pageTitle} - General Practice (GP)`}
        />
        <meta
          property="twitter:description"
          content={`${props.pageTitle} - General Practice (GP), Book an Appointment or Request a Prescription`}
        />
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = async (context: any) => {
  const slug = context.query.slug;
  const { data } = await getPracticeBySlug(slug);
  if (!data.id) {
    return {
      notFound: true,
    };
  }
  const pageTitle = data.name;
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
};

export default PracticePage;
