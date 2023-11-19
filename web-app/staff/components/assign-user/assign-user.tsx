import {
  Divider,
  Flex,
  Icon,
  Input,
  Text,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Stack,
  useBreakpointValue,
  Avatar,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { components } from "../../schemas/api-types";
import { FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useSearchLoading } from "../../state/search";
export type StaffApiType = components["schemas"]["StaffMember"];

export interface AssignUserDropdownProps {
  staffMembers: StaffApiType[];
  onAssignUser: (staffMember: StaffApiType) => void;
  onSearch: (searchTerm: string) => void;
  onClearAssignedUser: () => void;
  assignedUser?: StaffApiType;
}

export function AssignUserDropdownComponent({
  staffMembers,
  onSearch,
  onAssignUser,
  onClearAssignedUser,
  assignedUser,
}: AssignUserDropdownProps) {
  const { loading: searchLoading } = useSearchLoading();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(assignedUser === undefined);

  useEffect(() => {
    if (search) {
      onSearch(search);
    }
  }, [search, onSearch]);
  return (
    <OutsideClickHandler
      display="flex"
      onOutsideClick={() => {
        if (!assignedUser) {
          setShowSearch(true);
        } else {
          setShowSearch(false);
        }
      }}
    >
      {!showSearch ? (
        <Stack
          w={"100%"}
          position={"relative"}
          justifyContent={"center"}
          alignItems={"center"}
          borderColor={"gray-200"}
          borderWidth={"0.1rem"}
          borderRadius="lg"
          bgColor="bg-surface"
          cursor={"pointer"}
          userSelect={"none"}
          direction={"row"}
          p={"1rem"}
          onClick={() => {
            setShowSearch(true);
          }}
        >
          {assignedUser?.full_name ? (
            <HStack direction={"row"} justify={"space-evenly"}>
              <Stack direction={"row"}>
                <Avatar size={"xs"} name={assignedUser?.full_name || ""} />
                <Text>{assignedUser?.full_name}</Text>
              </Stack>
              <IconButton
                aria-label="Clear assigned user"
                icon={<Icon as={FiX} />}
                variant={"ghost"}
                onClick={(e) => {
                  setSearch("");
                  setShowSearch(true);
                  onClearAssignedUser();
                }}
              />
            </HStack>
          ) : null}
          {searchLoading ? (
            <Spinner emptyColor="gray.200" color="blue.500" />
          ) : null}
        </Stack>
      ) : (
        <Stack
          w={"100%"}
          position={"relative"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <InputGroup size="lg" maxW={{ md: "sm" }}>
            <InputLeftElement pointerEvents="none">
              {searchLoading ? (
                <Spinner emptyColor="gray.200" color="blue.500" />
              ) : (
                <Avatar size="xs" />
              )}
            </InputLeftElement>
            <Input
              placeholder="Assign user"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <InputRightElement
              cursor={"pointer"}
              hidden={staffMembers.length === 0 || search.length === 0}
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
            top={isMobile ? "2%" : "95%"}
            gap={1}
          >
            {staffMembers?.map((suggestion) => {
              return (
                <Stack
                  key={suggestion.id}
                  cursor={"pointer"}
                  userSelect={"none"}
                  direction={"row"}
                  spacing={"4"}
                  onClick={() => {
                    onAssignUser(suggestion);
                    setShowSearch(false);
                  }}
                >
                  <Avatar size={"xs"} name={suggestion.full_name || ""} />
                  <Text noOfLines={1} fontWeight={"semibold"}>
                    {suggestion.full_name}
                  </Text>
                </Stack>
              );
            })}
            {(!staffMembers || staffMembers?.length === 0) &&
            !(search === undefined || search.length === 0) ? (
              <Stack userSelect={"none"} direction={"row"} spacing={"4"}>
                <Text noOfLines={1} color={"muted"}>
                  No matches found
                </Text>
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      )}
    </OutsideClickHandler>
  );
}
