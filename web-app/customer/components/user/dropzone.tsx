import {
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  IconButton,
  Progress,
  Spinner,
  Square,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiUploadCloud, FiFile, FiX } from "react-icons/fi";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";

interface DropzoneProps {
  onSubmit: (files: File) => void;
  uploadProgress?: number;
  loading?: boolean;
  completed?: boolean;
}

export const Dropzone = ({
  onSubmit,
  uploadProgress,
  loading,
  completed,
}: DropzoneProps) => {
  const [files, setFiles] = useState<File>();
  const onDrop = useCallback(
    (acceptedFiles: any) => {
      setFiles(acceptedFiles[0]);
      onSubmit(acceptedFiles[0]);
    },
    [onSubmit]
  );
  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: files !== undefined,
  });

  return (
    <Center
      borderWidth="1px"
      borderRadius="lg"
      px="6"
      py="4"
      bg={isDragActive ? "bg-subtle" : "white"}
      {...getRootProps()}
      w="100%"
      maxW={{ lg: "3xl" }}
    >
      <VStack spacing="3" hidden={files !== undefined}>
        <Square size="10" bg="bg-subtle" borderRadius="lg">
          <Icon as={FiUploadCloud} boxSize="5" color="muted" />
        </Square>
        <VStack spacing="1">
          <HStack spacing="1" whiteSpace="nowrap">
            <Button variant="link" colorScheme="blue" size="sm">
              Click to upload
            </Button>
            <Text fontSize="sm" color="muted">
              or drag and drop
            </Text>
          </HStack>
          <Text fontSize="xs" color="muted">
            Image or PDF
          </Text>
        </VStack>
      </VStack>
      {files ? (
        <Flex key={files.name} direction={"column"}>
          <HStack spacing="2">
            <Square size="10">
              <Icon as={FiFile} boxSize="5" color="muted" />
            </Square>
            <Text noOfLines={1}>{files.name}</Text>
            <IconButton
              icon={<FiX />}
              aria-label="Delete"
              variant={"outline"}
              color={"red"}
              hidden={loading || completed}
              onClick={() => {
                setFiles(undefined);
              }}
            />
            <Spinner
              hidden={!loading || completed}
              emptyColor="gray.200"
              color="blue.500"
            />
          </HStack>
          <Progress
            hidden={!loading || completed}
            value={uploadProgress ? uploadProgress * 100 : 0}
          />
        </Flex>
      ) : null}
    </Center>
  );
};
