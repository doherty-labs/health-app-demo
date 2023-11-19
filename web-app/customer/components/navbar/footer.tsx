import { Box, Container, Flex, Text, Stack } from "@chakra-ui/react";
import { LogoNegative } from "../logo/logo";

export const Footer = () => (
  <Box bg="bg-accent" color="on-accent">
    <Container as="footer" role="contentinfo" py={{ base: "12", md: "16" }}>
      <Stack>
        <Flex direction={"row"} justifyContent={"space-between"}>
          <LogoNegative />
        </Flex>
        <Flex direction={"row"}>
          <Text fontSize="sm" color="on-accent-subtle">
            &copy; {new Date().getFullYear()} Doherty Labs Ltd. All rights
            reserved.
          </Text>
        </Flex>
      </Stack>
    </Container>
  </Box>
);
