import { Divider, Flex, Stack } from "@chakra-ui/react";
import { FiHome, FiLogIn, FiSettings } from "react-icons/fi";
import { UserProfile } from "./user-profile";
import { NavButton } from "./nav-button";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Logo } from "../logo/logo";
import { useRouter } from "next/router";

export const Sidebar = () => {
  const { user } = useUser();
  const { push } = useRouter();
  return (
    <Flex as="section" minH="100vh" bg="bg-canvas">
      <Flex
        flex="1"
        bg="bg-surface"
        overflowY="auto"
        boxShadow="sm"
        maxW={{ base: "full", sm: "xs" }}
        py={{ base: "6", sm: "8" }}
        px={{ base: "4", sm: "6" }}
      >
        <Stack justify="space-between" spacing="1">
          <Stack spacing={{ base: "5", sm: "6" }} shouldWrapChildren>
            <Logo />
            <Stack spacing="1">
              <NavButton label="Home" icon={FiHome} variant="ghost" />
              <NavButton
                icon={FiLogIn}
                label="Sign in"
                variant="ghost"
                hidden={user !== undefined}
                onClick={() => {
                  push("/api/auth/login");
                }}
              />
            </Stack>
          </Stack>
          {user ? (
            <Stack spacing={{ base: "5", sm: "6" }}>
              <Stack spacing="1">
                <NavButton label="Settings" icon={FiSettings} variant="ghost" />
              </Stack>
              <Divider />
              <UserProfile
                name={user.name || ""}
                image={user.picture || ""}
                email={user.email || ""}
              />
            </Stack>
          ) : null}
        </Stack>
      </Flex>
    </Flex>
  );
};
