import { ReactElement, useState } from "react";
import Layout from "../components/layout";
import type { NextPageWithLayout } from "./_app";
import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  InputGroup,
  Icon,
  InputLeftElement,
  Input,
  Center,
  Spinner,
  Divider,
  useBreakpointValue,
  InputRightElement,
} from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";
import { FaLocationArrow } from "react-icons/fa";
import { useSearchPractice } from "../components/hooks/search-practice";
import { components } from "../schemas/api-types";
import { useSearchbarLoading } from "../components/state/loading";
import Head from "next/head";
import { useRouter } from "next/router";
type PracticeType = components["schemas"]["Practice"];

const Home: NextPageWithLayout = () => {
  const [search, setSearch] = useState<string | undefined>();
  const { loading } = useSearchbarLoading();
  const { suggestions } = useSearchPractice<PracticeType[]>({
    search,
  });
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { push } = useRouter();

  return (
    <Center
      py={{ base: "2", sm: "12", md: "24" }}
      px={{ base: "2", sm: "2", md: "24" }}
    >
      <Box bg="bg-surface" boxShadow="sm" borderRadius="xl">
        <Container py={{ base: "16", md: "24" }} px={{ base: "10", md: "24" }}>
          <Stack spacing={{ base: "8", md: "10" }}>
            <Stack spacing={{ base: "4", md: "5" }} align="center">
              <Heading size={{ base: "sm", md: "md" }} noOfLines={1}>
                Find your GP
              </Heading>
              <Text
                color="muted"
                maxW="2xl"
                textAlign="center"
                fontSize="xl"
                noOfLines={2}
              >
                Find your GP practice and book your appointment online.
              </Text>
            </Stack>
            <Stack
              spacing={{ base: "8", sm: "8", md: "4" }}
              direction={{ base: "column", sm: "column", md: "row" }}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Stack
                w={"100%"}
                position={"relative"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <InputGroup size="lg" maxW={{ md: "sm" }}>
                  <InputLeftElement pointerEvents="none">
                    {loading ? (
                      <Spinner emptyColor="gray.200" color="blue.500" />
                    ) : (
                      <Icon as={FiSearch} color="fg-muted" boxSize="5" />
                    )}
                  </InputLeftElement>
                  <Input
                    placeholder="Search"
                    value={search || ""}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                  <InputRightElement
                    cursor={"pointer"}
                    hidden={!suggestions || suggestions?.length === 0}
                    onClick={() => {
                      setSearch("");
                    }}
                  >
                    <Icon as={FiX} color="fg-muted" boxSize="5" />
                  </InputRightElement>
                </InputGroup>
                <Stack
                  borderColor={"gray-200"}
                  borderWidth={"0.1rem"}
                  borderRadius="lg"
                  p={"1rem"}
                  divider={<Divider />}
                  hidden={!search || search.length === 0}
                  position={!isMobile ? "absolute" : "relative"}
                  zIndex={!isMobile ? 2 : 1}
                  bgColor="bg-surface"
                  w={"100%"}
                  maxW={{ md: "sm" }}
                  top={"95%"}
                  gap={1}
                >
                  {suggestions?.map((suggestion) => {
                    return (
                      <Stack
                        key={suggestion.id}
                        cursor={"pointer"}
                        userSelect={"none"}
                        direction={{
                          base: "column",
                          sm: "column",
                          md: "row",
                        }}
                        spacing={"4"}
                        onClick={() => {
                          push(`/practice/${suggestion.slug}`);
                        }}
                      >
                        <Text noOfLines={1} fontWeight={"semibold"}>
                          {suggestion.name}
                        </Text>
                        <Text color={"muted"} noOfLines={1}>
                          <Icon
                            as={FaLocationArrow}
                            color={"muted"}
                            mr="0.5rem"
                            fontSize={"0.8rem"}
                          />
                          {suggestion.address_line_1}
                        </Text>
                      </Stack>
                    );
                  })}
                  {(!suggestions || suggestions?.length === 0) &&
                  !(search === undefined || search.length === 0) ? (
                    <Stack userSelect={"none"} direction={"row"} spacing={"4"}>
                      <Text noOfLines={1} color={"muted"}>
                        No matches found
                      </Text>
                    </Stack>
                  ) : null}
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Center>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Find your GP</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export default Home;
