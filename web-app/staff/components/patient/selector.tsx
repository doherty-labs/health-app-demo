import {
  Stack,
  InputGroup,
  InputLeftElement,
  Icon,
  Input,
  Divider,
  Text,
  Center,
  Skeleton,
  HStack,
  Button,
} from "@chakra-ui/react";
import { use, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { components } from "../../schemas/api-types";
import _ from "lodash";
import moment from "moment";
import { useSearchLoading } from "../../state/search";
import { useRouter } from "next/router";

type PatientType = components["schemas"]["Patient"];

export interface PatientSelectorProps {
  searchResults: PatientType[];
  selectedPatient?: PatientType | null;
  onSearch: (search: string) => void;
  onSelect: (patient: PatientType | null) => void;
}

export interface PatientCardProps {
  patient: PatientType;
  onClick: () => void;
  selected?: boolean;
}

export function PatientCardComponent({
  patient,
  onClick,
  selected,
}: PatientCardProps) {
  const address_keys = [
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "zip_code",
    "country",
  ];
  return (
    <Stack
      key={patient.id}
      bg="bg-surface"
      boxShadow={"sm"}
      borderRadius={"lg"}
      p={4}
      cursor={selected ? "default" : "pointer"}
      userSelect={"none"}
      onClick={
        !selected
          ? () => {
              onClick();
            }
          : () => {}
      }
    >
      <Stack>
        <HStack justify={"space-between"}>
          <Text fontSize={"md"} as={"b"} color={"muted"}>
            Name:
          </Text>
          <Text>{patient?.full_name}</Text>
        </HStack>

        <HStack justify={"space-between"}>
          <Text fontSize={"md"} as={"b"} color={"muted"}>
            Email:
          </Text>
          <Text>{patient?.email}</Text>
        </HStack>

        <HStack justify={"space-between"}>
          <Text fontSize={"md"} as={"b"} color={"muted"}>
            Phone:
          </Text>
          <Text>{patient?.phone}</Text>
        </HStack>
        <HStack justify={"space-between"}>
          <Text fontSize={"md"} as={"b"} color={"muted"}>
            Date of birth:
          </Text>
          <Text>
            {moment(patient?.date_of_birth).format("DD/MM/YYYY")} (
            {moment().diff(patient?.date_of_birth, "years")} years old)
          </Text>
        </HStack>
        <HStack justify={"space-between"}>
          <Text fontSize={"md"} as={"b"} color={"muted"}>
            Gender:
          </Text>
          <Text> {_.startCase(patient?.gender)}</Text>
        </HStack>
        <Stack direction={"column"}>
          <Text fontSize={"md"} as={"b"} color={"muted"}>
            Address:
          </Text>
          <Text noOfLines={5} maxW={"sm"}>
            {_.chain(address_keys)
              .map((key: string) => {
                const patientTemp: any = patient;
                return patientTemp?.[key];
              })
              .compact()
              .join(", ")
              .value()}
          </Text>
        </Stack>
      </Stack>
      <Stack direction={"row"} justify={"flex-end"} hidden={!selected}>
        <Button
          aria-label={"clear"}
          variant={"outline"}
          onClick={() => {
            onClick();
          }}
        >
          <HStack>
            <FiX /> <Text>Clear Selection</Text>
          </HStack>
        </Button>
      </Stack>
    </Stack>
  );
}

export function PatientSelectorComponent({
  searchResults,
  selectedPatient,
  onSearch,
  onSelect,
}: PatientSelectorProps) {
  const [search, setSearch] = useState("");
  const { loading } = useSearchLoading();
  const { push } = useRouter();

  return (
    <Center flexDirection={"column"} gap={2}>
      {selectedPatient ? (
        <PatientCardComponent
          patient={selectedPatient}
          onClick={() => {
            onSelect(null);
          }}
          selected={true}
        />
      ) : (
        <Stack divider={<Divider />}>
          <Stack
            position={"relative"}
            direction={"row"}
            justify={"center"}
            align={"center"}
          >
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="fg-muted" boxSize="5" />
              </InputLeftElement>
              <Input
                placeholder="Search Patients"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  onSearch(e.target.value);
                }}
              />
            </InputGroup>
            <Button
              px={8}
              onClick={() => {
                push("/add-patient");
              }}
            >
              Add Patient
            </Button>
          </Stack>
          {searchResults.length > 0 && !loading ? (
            <Stack divider={<Divider />}>
              {searchResults.map((patient) => {
                return (
                  <PatientCardComponent
                    key={patient.id}
                    patient={patient}
                    onClick={() => {
                      onSelect(patient);
                    }}
                  />
                );
              })}
            </Stack>
          ) : null}

          {loading ? (
            <Stack direction={"column"} w={"100%"}>
              <Skeleton height={"2rem"} w={"100%"} />
              <Skeleton height={"2rem"} w={"100%"} />
              <Skeleton height={"2rem"} w={"100%"} />
            </Stack>
          ) : null}

          {searchResults.length === 0 && !loading ? (
            <Stack>
              <Center>
                <Text color={"muted"}>No patient results.</Text>
              </Center>
            </Stack>
          ) : null}
        </Stack>
      )}
    </Center>
  );
}
