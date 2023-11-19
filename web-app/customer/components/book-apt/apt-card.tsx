import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { components } from "../../schemas/api-types";
import { useEffect, useState } from "react";
import { useFileProgressPatientId, useLoading } from "../state/loading";
import { Dropzone } from "../user/dropzone";
import moment from "moment";
import { FiDownload } from "react-icons/fi";
import { useRouter } from "next/router";

type BookingType = components["schemas"]["Appointment"];
type DocsApiType = components["schemas"]["Appointment"]["documents"];

interface UploadFileCardProps {
  onSubmitId: (idFiles: File) => void;
  docs?: DocsApiType;
  onDownload: (id: number) => void;
  onDelete: (id: number) => void;
}
interface Props extends BookingType {
  uploadCard: UploadFileCardProps;
}

export const UploadFileCard = ({
  docs,
  onDownload,
  onSubmitId,
}: UploadFileCardProps) => {
  const [idFiles, setIdFiles] = useState<File>();
  const { loading } = useLoading();
  const {
    completed: idC,
    loading: idL,
    progress: idP,
  } = useFileProgressPatientId();

  useEffect(() => {
    if (idFiles) {
      onSubmitId(idFiles);
    }
  }, [idFiles, onSubmitId]);

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
          <FormLabel>Images</FormLabel>
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
          <FormHelperText color="subtle">
            Images that may assist the doctor in diagnosing your condition.
          </FormHelperText>
        </FormControl>
        <Skeleton isLoaded={!loading}>
          <Stack w={"100%"}>
            <Text fontWeight={"semibold"} hidden={docs?.length === 0}>
              File History
            </Text>
            <Stack divider={<Divider />} justify={"space-between"}>
              {docs?.map((doc) => {
                return (
                  <HStack key={doc.id} justify={"space-evenly"}>
                    <Text>Uploaded File</Text>
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

export function AptCard({ uploadCard }: Props) {
  const { replace } = useRouter();
  return (
    <Stack w="100%" divider={<Divider />}>
      <Box
        as="section"
        bg="bg.surface"
        pt={{ base: "4", md: "8" }}
        pb={{ base: "6", md: "6" }}
      >
        <Container>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                Upload Files
              </Heading>
              <Text color="fg.muted">
                Images that would assist diagnosis. Optional stage.
              </Text>
            </Stack>
            <Stack
              direction={{ base: "row", sm: "row", md: "row" }}
              spacing={"3"}
              gap={"1"}
            >
              <Button
                order={{ base: "2", md: "1" }}
                variant="primary"
                onClick={() => {
                  replace("/appointments");
                }}
              >
                Finish
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container p={4}>
        <Stack
          direction={{ base: "column", lg: "row" }}
          spacing={{ base: "5", lg: "8" }}
          justify="center"
        >
          <UploadFileCard {...uploadCard} />
        </Stack>
      </Container>
    </Stack>
  );
}
