import {
  Box,
  Stack,
  Heading,
  Text,
  Container,
  SimpleGrid,
  Center,
} from "@chakra-ui/react";

export interface NoticeRowProps {
  title: string;
  content: string;
  updatedAt: string;
}

export interface NoticesTabProps {
  notices: NoticeRowProps[];
}

export function NoticeRow({ title, content, updatedAt }: NoticeRowProps) {
  return (
    <Box
      p={{ base: "6", md: "8" }}
      borderColor={"gray.200"}
      borderWidth={"0.1rem"}
      borderRadius={"lg"}
    >
      <Stack spacing="4">
        <Stack spacing="1">
          <Heading size={"xs"} fontWeight="medium" noOfLines={2}>
            {title}
          </Heading>
          <Text fontSize="sm" fontWeight="small" color={"gray.500"}>
            Posted {updatedAt}
          </Text>
        </Stack>
        <Text fontSize="md">{content}</Text>
      </Stack>
    </Box>
  );
}

export function NoticesTab({ notices }: NoticesTabProps) {
  return (
    <Container>
      <SimpleGrid
        columns={1}
        columnGap="4"
        rowGap={"4"}
        hidden={notices.length === 0}
      >
        {notices.map((item) => {
          return <NoticeRow key={item.title} {...item} />;
        })}
      </SimpleGrid>
      <Center hidden={notices.length > 0}>
        <Text fontSize={"lg"}>No notices posted</Text>
      </Center>
    </Container>
  );
}
