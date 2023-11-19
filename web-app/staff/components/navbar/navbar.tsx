import { useUser } from "@auth0/nextjs-auth0/client";

import {
  Avatar,
  Box,
  BoxProps,
  Button,
  ButtonGroup,
  Container,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  useBreakpointValue,
  useDisclosure,
  forwardRef,
} from "@chakra-ui/react";
import { FiLogIn, FiSettings } from "react-icons/fi";
import { ToggleButton } from "./toggle-button";
import { Sidebar } from "./drawer";
import { NavButton } from "./nav-button";
import { Logo } from "../logo/logo";
import { useRouter } from "next/router";
import { useRouteChangeLoading } from "../../state/loading";
import { useEffect } from "react";
import { useUserProps } from "../../state/user";

export function UserSectionNavbar() {
  const { user } = useUser();
  const { push } = useRouter();

  return (
    <>
      {user ? (
        <HStack spacing="4">
          <ButtonGroup variant="ghost" spacing="1">
            <IconButton
              icon={<FiSettings fontSize="1.25rem" />}
              onClick={() => {
                push("/user");
              }}
              aria-label="Settings"
            />
            <Avatar
              boxSize="10"
              name={user.name || ""}
              src={user.picture || ""}
              onClick={() => {
                push("/user");
              }}
              cursor="pointer"
            />
          </ButtonGroup>
        </HStack>
      ) : (
        <HStack spacing="4">
          <ButtonGroup variant="ghost" spacing="1">
            <NavButton
              icon={FiLogIn}
              label="Sign in"
              onClick={() => {
                push("/api/auth/login");
              }}
            />
          </ButtonGroup>
        </HStack>
      )}
    </>
  );
}

export const NavbarComponent = forwardRef<BoxProps, "div">((props, ref) => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { user } = useUser();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { loading } = useRouteChangeLoading();
  const { push } = useRouter();
  const { practice } = useUserProps();

  useEffect(() => {
    if (loading) {
      onClose();
    }
  }, [loading, onClose]);

  return (
    <Box as="nav" bg="bg-surface" boxShadow="sm" ref={ref} {...props}>
      <Container py={{ base: "3", lg: "4" }}>
        <Flex justify="space-between">
          <HStack spacing="4">
            {isDesktop && (
              <ButtonGroup variant="ghost" spacing="1">
                <Logo name={practice?.name || "GP Base"} />
                <Button
                  hidden={user === undefined}
                  onClick={() => {
                    push("/appointments");
                  }}
                >
                  Appointments
                </Button>
                <Button
                  hidden={user === undefined}
                  onClick={() => {
                    push("/prescriptions");
                  }}
                >
                  Prescriptions
                </Button>
                <Button
                  hidden={user === undefined}
                  onClick={() => {
                    push("/availability");
                  }}
                >
                  Availability
                </Button>
                <Button
                  hidden={user === undefined}
                  onClick={() => {
                    push("/practice-listing");
                  }}
                >
                  Practice
                </Button>
              </ButtonGroup>
            )}
          </HStack>
          {isDesktop ? (
            <UserSectionNavbar />
          ) : (
            <>
              <Logo name={practice?.name || "GP Base"} />
              <ToggleButton
                isOpen={isOpen}
                aria-label="Open Menu"
                onClick={onToggle}
              />
              <Drawer
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                isFullHeight
                preserveScrollBarGap
                // Only disabled for showcase
                trapFocus={false}
              >
                <DrawerOverlay />
                <DrawerContent>
                  <Sidebar />
                </DrawerContent>
              </Drawer>
            </>
          )}
        </Flex>
      </Container>
    </Box>
  );
});
