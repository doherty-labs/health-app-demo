import {
  Box,
  HStack,
  FormControl,
  FormLabel,
  Stack,
  Text,
  IconButton,
  Divider,
  ButtonGroup,
  Skeleton,
} from "@chakra-ui/react";
import { Dropzone } from "./dropzone";
import { useEffect, useState } from "react";
import {
  useFileProgressPatientId,
  useFileProgressPatientPoa,
  useLoading,
} from "../state/loading";
import { components } from "../../schemas/api-types";
import { FiDownload, FiX } from "react-icons/fi";
import moment from "moment";
export type DocsApiType = components["schemas"]["Patient"]["documents"];
interface ProfileCardProps {
  onSubmitId: (idFiles: File) => void;
  onSubmitPoa: (poaFiles: File) => void;
  docs?: DocsApiType;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ProfileCard = ({
  onSubmitId,
  onSubmitPoa,
  onDownload,
  onDelete,
  docs,
}: ProfileCardProps) => {
  const [idFiles, setIdFiles] = useState<File>();
  const [poaFiles, setPoaFiles] = useState<File>();
  const { loading } = useLoading();
  const {
    completed: idC,
    loading: idL,
    progress: idP,
  } = useFileProgressPatientId();
  const {
    completed: poaC,
    loading: poaL,
    progress: poaP,
  } = useFileProgressPatientPoa();

  useEffect(() => {
    if (idFiles) {
      onSubmitId(idFiles);
    }
  }, [idFiles, onSubmitId]);

  useEffect(() => {
    if (poaFiles) {
      onSubmitPoa(poaFiles);
    }
  }, [poaFiles, onSubmitPoa]);

  return (
    <Box
      bg="bg-surface"
      boxShadow="sm"
      borderRadius="lg"
      flex="1"
      maxW={{ lg: "3xl" }}
    >
      <Stack
        spacing="5"
        px={{ base: "4", md: "6" }}
        py={{ base: "5", md: "6" }}
      >
        <FormControl id="poa">
          <FormLabel>Passport / Driving License</FormLabel>
          <Stack
            spacing={{ base: "3", md: "5" }}
            direction={{ base: "column", sm: "row" }}
          >
            <Dropzone
              onSubmit={(files) => {
                setIdFiles(files);
              }}
              uploadProgress={idP}
              loading={idL}
              completed={idC}
            />
          </Stack>
        </FormControl>
        <FormControl id="poa">
          <FormLabel>Proof of Address</FormLabel>
          <Stack
            spacing={{ base: "3", md: "5" }}
            direction={{ base: "column", sm: "row" }}
          >
            <Dropzone
              onSubmit={(files) => {
                setPoaFiles(files);
              }}
              uploadProgress={poaP}
              loading={poaL}
              completed={poaC}
            />
          </Stack>
        </FormControl>

        <Skeleton isLoaded={!loading}>
          <Stack w={"100%"} hidden={docs?.length === 0}>
            <Text fontWeight={"semibold"}>Document History</Text>
            <Stack divider={<Divider />} justify={"space-between"}>
              {docs?.map((doc) => {
                return (
                  <HStack key={doc.id} justify={"space-between"}>
                    {doc.is_proof_of_address ? (
                      <Text>Proof of Address</Text>
                    ) : null}
                    {doc.is_id ? <Text>ID Document</Text> : null}
                    <Text>{moment(doc.uploaded_at).format("DD/MM/YYYY")}</Text>
                    <ButtonGroup>
                      <IconButton
                        icon={<FiDownload fontSize="1.25rem" />}
                        aria-label="download"
                        variant={"outline"}
                        onClick={() => {
                          if (!doc.id) return;
                          onDownload(doc.id);
                        }}
                      />
                    </ButtonGroup>
                  </HStack>
                );
              })}
            </Stack>
          </Stack>
        </Skeleton>
      </Stack>
    </Box>
  );
};
