import {
  Container,
  Divider,
  Heading,
  Stack,
  Text,
  Box,
  Avatar,
} from "@chakra-ui/react";
import { components } from "../../schemas/api-types";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";

type PracticeType = components["schemas"]["Practice"];
type TeamMember = components["schemas"]["Practice"]["team_members"][0];

export interface SelectTeamMemberProps {
  practice: PracticeType;
}

interface TeamListProps {
  people: TeamMember[];
}

function TeamListComponent({ people }: TeamListProps) {
  const { push } = useRouter();
  return (
    <ul
      role="list"
      className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
    >
      {people.map((person) => (
        <li
          key={person.id}
          className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 hover:cursor-pointer"
          onClick={() => push(`/availability/${person.id}/manage`)}
        >
          <div className="flex min-w-0 gap-x-4">
            <Avatar
              boxSize="10"
              name={`${person.first_name} ${person.last_name}`}
            />
            <div className="min-w-0 flex-auto">
              <div className="text-sm font-semibold leading-6 text-gray-900">
                <div>
                  <span className="absolute inset-x-0 -top-px bottom-0" />
                  {`${person.first_name} ${person.last_name}`}
                </div>
              </div>
              <div className="mt-1 flex text-xs leading-5 text-gray-500">
                <div className="relative truncate">{person.bio}</div>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-x-4">
            <div className="hidden sm:flex sm:flex-col sm:items-end">
              <p className="text-sm leading-6 text-gray-900">
                {person.job_title}
              </p>
            </div>
            <ChevronRightIcon
              className="h-5 w-5 flex-none text-gray-400"
              aria-hidden="true"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SelectTeamMember({ practice }: SelectTeamMemberProps) {
  return (
    <Stack divider={<Divider />}>
      <Box as="section" bg="bg.surface" pt={8} pb={6}>
        <Container>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                Manage Availability
              </Heading>
              <Text color="fg.muted">
                Manage available appointments of your team.
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container p={8}>
        <Stack>
          <TeamListComponent people={practice.team_members} />
        </Stack>
      </Container>
    </Stack>
  );
}
