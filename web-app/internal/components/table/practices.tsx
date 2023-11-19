import {
  Center,
  Divider,
  Skeleton,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  Checkbox,
  IconButton,
  Table,
  TableProps,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Box,
  Button,
  ButtonGroup,
  Container,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FiEdit2, FiSearch, FiTrash2, FiUserPlus } from "react-icons/fi";
import { AiOutlineFileSearch } from "react-icons/ai";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";
import { components } from "../../schemas/api-types";
import { useLoading, useSearchbarLoading } from "../../state/loading";
type PracticeType = components["schemas"]["Practice"];

interface TableHeaderProps {
  name: string;
  id: string;
  sort: "asc" | "desc" | "none";
  hasCheckbox: boolean;
  isChecked?: boolean;
  onCheckboxChange: (checked: boolean) => void;
  onSort: (sort: "asc" | "desc" | "none") => void;
  canSort: boolean;
}

interface NiceTableProps<Type> {
  data: Type[];
  headers: Omit<TableHeaderProps, "onSort" | "onCheckboxChange">[];
  count: number;
  currentPage: number;
  maxPage: number;
  title: string;
  pageSize: number;
  additionalTableProps?: TableProps;
  selected: Type[];
  sort: { id: string; direction: "asc" | "desc" | "none" }[];
  onPageChange: (page: number) => void;
  onSort: (sort: { id: string; direction: "asc" | "desc" | "none" }[]) => void;
  onRowClick: (row: Type) => void;
  onSearch: (search: string) => void;
  onCheckboxChange: (row: Type[]) => void;
  onPageSizeChange: (size: number) => void;
  onEditRow: (row: Type) => void;
  onDeleteRow: (row: Type) => void;
  onAddRow: () => void;
  onInviteRow: (row: Type) => void;
}

function TableHeader({
  name,
  sort,
  hasCheckbox,
  onCheckboxChange,
  onSort,
  canSort,
  isChecked,
}: TableHeaderProps) {
  return (
    <Th>
      <HStack spacing="3">
        <Checkbox
          hidden={!hasCheckbox}
          isChecked={isChecked}
          onChange={(e) => {
            onCheckboxChange(e.target.checked);
          }}
        />

        <HStack spacing="1">
          <Text
            onClick={() => {
              if (canSort) {
                if (sort === "asc") {
                  onSort("desc");
                } else if (sort === "desc") {
                  onSort("none");
                } else {
                  onSort("asc");
                }
              }
            }}
          >
            {name}
          </Text>

          {sort === "desc" && canSort ? (
            <Icon
              as={IoArrowDown}
              color="fg-muted"
              boxSize="4"
              onClick={() => {
                onSort("asc");
              }}
            />
          ) : null}

          {sort === "asc" && canSort ? (
            <Box>
              <Icon
                as={IoArrowUp}
                color="fg-muted"
                boxSize="4"
                onClick={() => {
                  onSort("desc");
                }}
              />
            </Box>
          ) : null}
        </HStack>
      </HStack>
    </Th>
  );
}

export function PracticesTableComponent(props: NiceTableProps<PracticeType>) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { loading } = useLoading();
  const searchBarLoading = useSearchbarLoading();

  return (
    <Container py={{ base: "4", md: "8" }} px={{ base: "0", md: 8 }}>
      <Skeleton isLoaded={!loading}>
        <Box bg="bg-surface" boxShadow={"sm"} borderRadius={"lg"}>
          <Stack spacing="5">
            <Box px={{ base: "4", md: "6" }} pt="5">
              <Stack
                direction={{ base: "column", md: "row" }}
                justify="space-between"
              >
                <Text fontSize="xl" fontWeight={"semibold"}>
                  {props.title}
                </Text>
                <Stack direction={"row"}>
                  <InputGroup maxW="xs">
                    <InputLeftElement pointerEvents="none">
                      {searchBarLoading.loading ? (
                        <Spinner emptyColor="gray.200" color="blue.500" />
                      ) : (
                        <Icon as={FiSearch} color="fg-muted" boxSize="5" />
                      )}
                    </InputLeftElement>
                    <Input
                      placeholder="Search"
                      onChange={(e) => {
                        props.onSearch(e.target.value);
                      }}
                    />
                  </InputGroup>
                  <ButtonGroup>
                    <Button
                      variant={"ghost"}
                      onClick={() => {
                        props.onAddRow();
                      }}
                    >
                      Add Practice
                    </Button>
                  </ButtonGroup>
                </Stack>
              </Stack>
            </Box>
            <Box overflowX="auto">
              {searchBarLoading.loading ? (
                <Container>
                  <Stack hidden={!searchBarLoading.loading}>
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                  </Stack>
                </Container>
              ) : (
                <>
                  {props.data.length > 0 ? (
                    <Table {...props.additionalTableProps}>
                      <Thead>
                        <Tr>
                          {props.headers.map((header) => {
                            return (
                              <TableHeader
                                key={header.id}
                                {...header}
                                onSort={(direction) => {
                                  if (direction === "none") {
                                    props.onSort(
                                      props.sort.filter(
                                        (i) => i.id !== header.id
                                      )
                                    );
                                  } else {
                                    props.onSort([
                                      ...props.sort.filter(
                                        (i) => i.id !== header.id
                                      ),
                                      { id: header.id, direction },
                                    ]);
                                  }
                                }}
                                onCheckboxChange={(checked) => {
                                  if (checked) {
                                    props.onCheckboxChange(props.data);
                                  } else {
                                    props.onCheckboxChange([]);
                                  }
                                }}
                                sort={
                                  props.sort.find((i) => i.id === header.id)
                                    ?.direction || "none"
                                }
                                isChecked={
                                  props.selected.length === props.data.length &&
                                  props.data.length > 0
                                }
                              />
                            );
                          })}
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {props.data.map((practice) => (
                          <Tr key={practice.id}>
                            <Td>
                              <HStack spacing="3">
                                <Checkbox
                                  isChecked={
                                    props.selected.filter(
                                      (i) => i.id === practice.id
                                    ).length > 0
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      props.onCheckboxChange([
                                        ...props.selected,
                                        practice,
                                      ]);
                                    } else {
                                      props.onCheckboxChange(
                                        props.selected.filter(
                                          (i) => i.id !== practice.id
                                        )
                                      );
                                    }
                                  }}
                                />
                                <Box>
                                  <Button
                                    variant={"ghost"}
                                    onClick={() => {
                                      props.onRowClick(practice);
                                    }}
                                  >
                                    {practice.name}
                                  </Button>
                                </Box>
                              </HStack>
                            </Td>

                            <Td>
                              <Text color="fg-muted" noOfLines={1}>
                                {practice.address_line_1}
                              </Text>
                            </Td>

                            <Td>
                              <HStack spacing="1">
                                <IconButton
                                  icon={<FiTrash2 fontSize="1.25rem" />}
                                  variant="tertiary"
                                  aria-label="Delete"
                                  onClick={() => {
                                    props.onDeleteRow(practice);
                                  }}
                                />
                                <IconButton
                                  icon={<FiEdit2 fontSize="1.25rem" />}
                                  variant="tertiary"
                                  aria-label="Edit"
                                  onClick={() => {
                                    props.onEditRow(practice);
                                  }}
                                />
                                <IconButton
                                  icon={<FiUserPlus fontSize="1.25rem" />}
                                  variant="tertiary"
                                  aria-label="Invite"
                                  onClick={() => {
                                    props.onInviteRow(practice);
                                  }}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Container>
                      <Center hidden={searchBarLoading.loading}>
                        <Stack direction={"row"}>
                          <Icon as={AiOutlineFileSearch} boxSize="8" />
                          <Text>No matches found</Text>
                        </Stack>
                      </Center>
                    </Container>
                  )}
                </>
              )}
            </Box>
            <Box px={{ base: "4", md: "6" }} pb="5">
              <HStack spacing="3" justify="space-between">
                {!isMobile && (
                  <Stack
                    direction="row"
                    spacing={"3"}
                    divider={
                      <Divider orientation="vertical" height={"1.5rem"} />
                    }
                  >
                    <Text color="muted" fontSize={"sm"}>
                      Showing page {props.currentPage} of {props.maxPage}
                    </Text>
                    <Text color="muted" fontSize={"sm"}>
                      {props.count} results
                    </Text>
                    <Text color="muted" fontSize={"sm"}>
                      Page size: {props.pageSize}
                    </Text>
                  </Stack>
                )}
                <ButtonGroup
                  spacing="3"
                  justifyContent="space-between"
                  width={{ base: "full", md: "auto" }}
                  variant="secondary"
                >
                  <Button
                    onClick={() => {
                      props.onPageChange(props.currentPage - 1);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      props.onPageChange(props.currentPage + 1);
                    }}
                  >
                    Next
                  </Button>
                </ButtonGroup>
              </HStack>
            </Box>
          </Stack>
        </Box>
      </Skeleton>
    </Container>
  );
}
