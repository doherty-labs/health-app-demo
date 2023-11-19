import { useUser } from "@auth0/nextjs-auth0/client";

import {
  Avatar,
  Box,
  BoxProps,
  ButtonGroup,
  Container,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  useBreakpointValue,
  useDisclosure,
  forwardRef,
} from "@chakra-ui/react";
import { FiLogIn } from "react-icons/fi";
import { ToggleButton } from "./toggle-button";
import { Sidebar } from "./drawer";
import { NavButton } from "./nav-button";
import { Logo } from "../logo/logo";
import { useRouter } from "next/router";

export function UserSectionNavbar() {
  const { user } = useUser();
  const { push } = useRouter();
  return (
    <>
      {user ? (
        <HStack spacing="4">
          <ButtonGroup variant="ghost" spacing="1">
            <Avatar
              boxSize="10"
              name={user.name || ""}
              src={user.picture || ""}
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
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <Box as="nav" bg="bg-surface" boxShadow="sm" ref={ref} {...props}>
      <Container py={{ base: "3", lg: "4" }}>
        <Flex justify="space-between">
          <HStack spacing="4">
            {isDesktop && (
              <ButtonGroup variant="ghost" spacing="1">
                <Logo />
              </ButtonGroup>
            )}
          </HStack>
          {isDesktop ? (
            <UserSectionNavbar />
          ) : (
            <>
              <Logo />
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
