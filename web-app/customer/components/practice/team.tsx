import {
  Container,
  Heading,
  Stack,
  Text,
  SimpleGrid,
  useBreakpointValue,
  Box,
  Avatar,
} from "@chakra-ui/react";

export interface MemberProps {
  profile?: string;
  name: string;
  role: string;
  description: string;
}

export interface TeamTabProps {
  members: MemberProps[];
}

export function TeamTab({ members }: TeamTabProps) {
  return (
    <Container py={{ base: "10", md: "10" }}>
      <Stack spacing={{ base: "12", md: "16" }}>
        <Stack spacing={{ base: "8", md: "8" }}>
          <Stack spacing="3" align="center" textAlign="center">
            <Stack spacing={{ base: "4", md: "5" }}>
              <Heading size={useBreakpointValue({ base: "sm", md: "md" })}>
                Meet our team
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} color="muted">
                Find out about the people running the practice.
              </Text>
            </Stack>
          </Stack>
        </Stack>
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          columnGap="8"
          rowGap={"6"}
        >
          {members.map((member) => (
            <Box
              key={member.name}
              p="6"
              borderRadius="md"
              borderColor={"gray-200"}
              borderWidth={"0.1rem"}
            >
              <Stack spacing="4" align="center" textAlign="center">
                <Stack>
                  <Stack spacing={{ base: "4", md: "5" }} align="center">
                    <Avatar
                      src={member.profile}
                      boxSize={{ base: "16", md: "20" }}
                    />
                    <Box>
                      <Text fontWeight="medium" fontSize="lg">
                        {member.name}
                      </Text>
                      <Text color="accent">{member.role}</Text>
                    </Box>
                  </Stack>
                  <Text color="muted">{member.description}</Text>
                </Stack>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
