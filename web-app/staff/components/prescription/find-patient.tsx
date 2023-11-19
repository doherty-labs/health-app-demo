import {
  Stack,
  Text,
  Divider,
  Box,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
} from "@chakra-ui/react";
import { PatientSelectorComponent } from "../patient/selector";
import { useSearchPatient } from "../hooks/search-patient";
import { useState } from "react";
import { components } from "../../schemas/api-types";
import { useRouter } from "next/router";

type PatientType = components["schemas"]["Patient"];
export interface CreateAppointmentProps {}

export function CreatePrescriptionComponent({}: CreateAppointmentProps) {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientType | null>(
    null,
  );
  const { results: patientSearchResults } = useSearchPatient({
    search: search,
  });
  const { push } = useRouter();
  return (
    <Stack divider={<Divider />}>
      <Box
        as="section"
        bg="bg.surface"
        pt={{ base: "4", md: "8" }}
        pb={{ base: "6", md: "6" }}
      >
        <Container>
          <Breadcrumb mb={4}>
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
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                Create Prescription
              </Heading>
              <Text color="fg.muted">
                Create an prescription on behalf of a patient.
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container pt={4} pb={"4rem"} px={8}>
        <PatientSelectorComponent
          searchResults={patientSearchResults}
          selectedPatient={selectedPatient}
          onSearch={(s) => {
            setSearch(s);
          }}
          onSelect={(p) => {
            setSelectedPatient(p);
            push(`/prescriptions/${p?.id}/create`);
          }}
        />
      </Container>
    </Stack>
  );
}
