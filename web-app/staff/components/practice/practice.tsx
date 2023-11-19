import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  StackDivider,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {
  AddressCard,
  ContactOptionSection,
  FeatureFlagSection,
  NoticeSection,
  OpeningHourSection,
  OpeningTimeExceptionSection,
  PracticeName,
  TeamMemberSection,
} from "./address";
import * as yup from "yup";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import Holidays from "date-holidays";
import { useLoading } from "../../state/loading";
import { useState } from "react";

const PracticeSummaryYupSchema = yup.object({
  id: yup.number(),
  name: yup.string().required(),
  slug: yup.string(),
  address_line_1: yup.string().required(),
  address_line_2: yup.string().default(""),
  city: yup.string().required(),
  state: yup.string().required(),
  zip_code: yup.string().required(),
  country: yup.string().required(),
  created_at: yup.string(),
  updated_at: yup.string(),
  feature_flags: yup
    .array()
    .of(
      yup.object({
        id: yup.number(),
        practice_id: yup.number(),
        created_at: yup.string(),
        updated_at: yup.string(),
        flag_id: yup.string().required(),
        flag_value: yup.boolean().required(),
      }),
    )
    .required()
    .default([]),
  team_members: yup
    .array()
    .of(
      yup.object({
        id: yup.number(),
        first_name: yup.string().required(),
        last_name: yup.string().required(),
        job_title: yup.string().required(),
        bio: yup.string(),
        created_at: yup.string(),
        updated_at: yup.string(),
      }),
    )
    .required()
    .default([]),
  opening_hours: yup
    .array()
    .of(
      yup.object({
        id: yup.number(),
        day_of_week: yup.number().required(),
        start_time: yup.string().when("is_closed", (is_closed, schema) => {
          if (is_closed[0]) return schema.notRequired().optional();
          return schema.required();
        }),
        end_time: yup
          .string()
          .test("is-greater", "end time should be greater", function (value) {
            const parent: any = this.parent;
            if (value?.length === 0 && parent.start_time?.length === 0)
              return true;
            return (
              moment(value, "HH:mm").isSameOrAfter(
                moment(parent.start_time, "HH:mm"),
              ) && moment(value, "HH:mm", true).isValid()
            );
          })
          .when("is_closed", (is_closed, schema) => {
            if (is_closed[0]) return schema.notRequired().optional();
            return schema.required();
          }),
        is_closed: yup.boolean().default(false),
        created_at: yup.string(),
        updated_at: yup.string(),
      }),
    )
    .required()
    .default([]),
  opening_time_exceptions: yup
    .array()
    .of(
      yup.object({
        id: yup.number(),
        start_datetime: yup.string(),
        end_datetime: yup
          .string()
          .test("is-greater", "end time should be greater", function (value) {
            const { start_datetime } = this.parent;
            if (value?.length === 0 && start_datetime?.length === 0)
              return true;
            return (
              moment(value, "DD/MM/YYYY").isSameOrAfter(
                moment(start_datetime, "DD/MM/YYYY"),
              ) && moment(value, "DD/MM/YYYY", true).isValid()
            );
          }),
        is_closed: yup.boolean().default(false),
        reason: yup.string().required(),
        created_at: yup.string(),
        updated_at: yup.string(),
      }),
    )
    .required()
    .default([]),
  contact_options: yup
    .array()
    .of(
      yup.object({
        id: yup.number(),
        name: yup.string().required(),
        value: yup.string().required(),
        href_type: yup.string().required(),
        created_at: yup.string(),
        updated_at: yup.string(),
      }),
    )
    .required()
    .default([]),
  notices: yup
    .array()
    .of(
      yup.object({
        id: yup.number(),
        title: yup.string().required(),
        description_markdown: yup.string().required(),
        created_at: yup.string(),
        updated_at: yup.string(),
      }),
    )
    .required()
    .default([]),
});
export type PracticeFormType = yup.InferType<typeof PracticeSummaryYupSchema>;

export interface PracticeFormComponentProps {
  onSubmit: () => void;
  inviteUser: (email: string) => void;
}

function PracticeForm({ onSubmit, inviteUser }: PracticeFormComponentProps) {
  const { clearErrors } = useFormContext();
  const { loading } = useLoading();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <Stack divider={<StackDivider />}>
      <Box
        as="section"
        bg="bg.surface"
        pt={{ base: "4", md: "8" }}
        pb={{ base: "12", md: "12" }}
      >
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Invite User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Email"
                type="email"
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                }}
              />
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                isLoading={loading}
                onClick={() => {
                  inviteUser(inviteEmail);
                  onClose();
                }}
              >
                Invite
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Container>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                Manage Practice
              </Heading>
              <Text color="fg.muted">
                Create or update a practice details below.
              </Text>
            </Stack>
            <Stack direction="row" spacing="3">
              <Button
                variant="outline"
                isLoading={loading}
                onClick={() => {
                  onOpen();
                }}
              >
                Invite Member
              </Button>
              <Button
                variant="primary"
                isLoading={loading}
                onClick={() => {
                  clearErrors();
                  onSubmit();
                }}
              >
                Submit
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container py={{ base: "4", md: "8" }}>
        <Stack spacing="5" divider={<StackDivider />}>
          <Stack
            direction={{ base: "column", lg: "row" }}
            spacing={{ base: "5", lg: "8" }}
            justify="space-between"
          >
            <Box flexShrink={0}>
              <Text fontSize="lg" fontWeight="medium">
                Practice Name
              </Text>
              <Text color="fg.muted" fontSize="sm">
                The name of the practice.
              </Text>
            </Box>
            <PracticeName w={{ lg: "xl" }} />
          </Stack>
          <Stack
            direction={{ base: "column", lg: "row" }}
            spacing={{ base: "5", lg: "8" }}
            justify="space-between"
          >
            <Box flexShrink={0}>
              <Text fontSize="lg" fontWeight="medium">
                Address
              </Text>
              <Text color="fg.muted" fontSize="sm">
                The address of the practice.
              </Text>
            </Box>
            <AddressCard w={{ lg: "xl" }} />
          </Stack>
          <TeamMemberSection />
          <OpeningHourSection />
          <ContactOptionSection />
          <OpeningTimeExceptionSection />
          <NoticeSection />
          <FeatureFlagSection />
        </Stack>
      </Container>
    </Stack>
  );
}
export interface PracticeFormScreenProps {
  onSubmit: (data: PracticeFormType) => void;
  defaultValues?: PracticeFormType;
  inviteUser: (email: string) => void;
}

export function PracticeFormScreen({
  onSubmit,
  defaultValues,
  inviteUser,
}: PracticeFormScreenProps) {
  const hd = new Holidays("GB", "NIR").getHolidays(new Date().getFullYear());
  const actualDefault: any = defaultValues
    ? defaultValues
    : {
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
        name: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
        team_members: [
          {
            id: undefined,
            first_name: "",
            last_name: "",
            job_title: "",
            bio: "",
            created_at: undefined,
            updated_at: undefined,
          },
        ],
        opening_hours: [
          {
            id: undefined,
            day_of_week: 1,
            start_time: "9:00",
            end_time: "17:00",
            created_at: undefined,
            updated_at: undefined,
          },
          {
            id: undefined,
            day_of_week: 2,
            start_time: "9:00",
            end_time: "17:00",
            created_at: undefined,
            updated_at: undefined,
          },
          {
            id: undefined,
            day_of_week: 3,
            start_time: "9:00",
            end_time: "17:00",
            created_at: undefined,
            updated_at: undefined,
          },
          {
            id: undefined,
            day_of_week: 4,
            start_time: "9:00",
            end_time: "17:00",
            created_at: undefined,
            updated_at: undefined,
          },
          {
            id: undefined,
            day_of_week: 5,
            start_time: "9:00",
            end_time: "17:00",
            created_at: undefined,
            updated_at: undefined,
          },
          {
            id: undefined,
            day_of_week: 6,
            start_time: "",
            end_time: "",
            is_closed: true,
            created_at: undefined,
            updated_at: undefined,
          },
          {
            id: undefined,
            day_of_week: 0,
            start_time: "",
            end_time: "",
            is_closed: true,
            created_at: undefined,
            updated_at: undefined,
          },
        ],
        contact_options: [],
        opening_time_exceptions: hd
          .filter((h) => h.type === "public")
          .map((h) => {
            return {
              id: undefined,
              start_datetime: moment(h.start).format("DD/MM/YYYY"),
              end_datetime: moment(h.end).format("DD/MM/YYYY"),
              is_closed: true,
              reason: h.name,
              created_at: undefined,
              updated_at: undefined,
            };
          }),
        notices: [],
      };
  const methods = useForm({
    resolver: yupResolver(PracticeSummaryYupSchema),
    defaultValues: actualDefault,
  });
  return (
    <FormProvider {...methods}>
      <PracticeForm
        inviteUser={inviteUser}
        onSubmit={methods.handleSubmit(
          (data) => {
            onSubmit(data as PracticeFormType);
          },
          (err) => {
            console.log(err);
          },
        )}
      />
    </FormProvider>
  );
}
