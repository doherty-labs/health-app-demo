import { ReactElement, useState } from "react";
import Layout from "../components/layout";
import type { NextPageWithLayout } from "./_app";
import {
  Container,
  Stack,
  Text,
  InputGroup,
  Icon,
  InputLeftElement,
  Input,
  Center,
  Spinner,
  Divider,
  InputRightElement,
  Flex,
} from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";
import { FaLocationArrow } from "react-icons/fa";
import { useSearchPractice } from "../components/hooks/search-practice";
import { components } from "../schemas/api-types";
import { useSearchbarLoading } from "../components/state/loading";
import Head from "next/head";
type PracticeType = components["schemas"]["Practice"];

const Search: NextPageWithLayout = () => {
  const [search, setSearch] = useState<string | undefined>();
  const { loading } = useSearchbarLoading();
  const { suggestions } = useSearchPractice<PracticeType[]>({
    search,
  });

  return (
    <Container>
      <Center p={4}>
        <Stack position={"relative"} w={"100%"} maxW={{ md: "sm" }}>
          <InputGroup size="lg" w={"100%"} maxW={{ md: "sm" }}>
            <InputLeftElement pointerEvents="none">
              {loading ? (
                <Spinner emptyColor="gray.200" color="blue.500" />
              ) : (
                <Icon as={FiSearch} color="fg-muted" boxSize="5" />
              )}
            </InputLeftElement>
            <Input
              placeholder="Search"
              value={search}
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
            hidden={!suggestions || suggestions?.length === 0}
            position={"relative"}
            zIndex={1}
            bgColor="bg-surface"
            w={"100%"}
            maxW={{ md: "sm" }}
            top={"99%"}
            gap={1}
          >
            {suggestions?.map((suggestion) => {
              return (
                <Stack
                  key={suggestion.id}
                  cursor={"pointer"}
                  userSelect={"none"}
                  direction={"row"}
                  spacing={"4"}
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
          </Stack>
        </Stack>
      </Center>
      <Stack justify={"center"} align={"center"}>
        {suggestions?.map((suggestion) => {
          return (
            <Flex
              key={suggestion.id}
              bg="bg-surface"
              boxShadow="sm"
              borderRadius="xl"
              p={8}
              w={"100%"}
              maxW={"lg"}
              cursor={"pointer"}
              userSelect={"none"}
            >
              <Stack>
                <Text fontWeight={"semibold"} noOfLines={1}>
                  {suggestion.name}
                </Text>
                <Stack>
                  <Text color={"muted"} fontSize="md" noOfLines={4}>
                    <Icon
                      as={FaLocationArrow}
                      color={"muted"}
                      mr="0.5rem"
                      fontSize={"0.8rem"}
                    />
                    {suggestion.address_line_1}, {suggestion.address_line_2},
                    {suggestion.zip_code}, {suggestion.city}
                  </Text>
                </Stack>
              </Stack>
            </Flex>
          );
        })}
      </Stack>
    </Container>
  );
};

Search.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Search GP</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export default Search;
