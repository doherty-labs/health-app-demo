import {
  Box,
  BoxProps,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Button,
  Divider,
  Flex,
  Switch,
  IconButton,
  Select,
  Textarea,
  Skeleton,
  Checkbox,
} from "@chakra-ui/react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { PracticeSummaryFormType } from "./types";
import { FiPlus, FiMinus } from "react-icons/fi";
import moment from "moment";
import { useLoading } from "../../state/loading";
import _ from "lodash";

export function PracticeName(props: BoxProps) {
  const { formState, register } = useFormContext<PracticeSummaryFormType>();
  const { loading } = useLoading();

  return (
    <Box as="form" bg="bg-surface" boxShadow="sm" borderRadius="lg" {...props}>
      <Skeleton isLoaded={!loading}>
        <Stack
          spacing="5"
          px={{ base: "4", md: "6" }}
          py={{ base: "5", md: "6" }}
        >
          <FormControl
            id="name"
            isInvalid={formState.errors.name !== undefined}
          >
            <FormLabel>Name</FormLabel>
            <Input {...register("name")} readOnly={true} />
          </FormControl>
        </Stack>
      </Skeleton>
    </Box>
  );
}

export function AddressCard(props: BoxProps) {
  const { formState, register } = useFormContext<PracticeSummaryFormType>();
  const { loading } = useLoading();
  return (
    <Box as="form" bg="bg-surface" boxShadow="sm" borderRadius="lg" {...props}>
      <Skeleton isLoaded={!loading}>
        <Stack
          spacing="5"
          px={{ base: "4", md: "6" }}
          py={{ base: "5", md: "6" }}
        >
          <FormControl
            id="address_line_1"
            isInvalid={formState.errors.address_line_1 !== undefined}
          >
            <FormLabel>Address Line 1</FormLabel>
            <Input {...register("address_line_1")} />
          </FormControl>
          <FormControl
            id="address_line_2"
            isInvalid={formState.errors.address_line_2 !== undefined}
          >
            <FormLabel>Address Line 2</FormLabel>
            <Input {...register("address_line_2")} />
          </FormControl>
          <Stack spacing="6" direction={{ base: "column", md: "row" }}>
            <FormControl
              id="city"
              isInvalid={formState.errors.city !== undefined}
            >
              <FormLabel>City</FormLabel>
              <Input {...register("city")} />
            </FormControl>
            <FormControl
              id="state"
              isInvalid={formState.errors.state !== undefined}
            >
              <FormLabel>County</FormLabel>
              <Input {...register("state")} />
            </FormControl>
            <FormControl
              id="zip"
              isInvalid={formState.errors.zip_code !== undefined}
            >
              <FormLabel>Post Code</FormLabel>
              <Input {...register("zip_code")} />
            </FormControl>
          </Stack>
          <FormControl
            id="country"
            isInvalid={formState.errors.country !== undefined}
          >
            <FormLabel>Country</FormLabel>
            <Input {...register("country")} />
          </FormControl>
        </Stack>
      </Skeleton>
    </Box>
  );
}

export function TeamMemberCard(props: BoxProps) {
  const { formState, register, control } =
    useFormContext<PracticeSummaryFormType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "team_members",
  });
  const { loading } = useLoading();

  return (
    <Box as="form" bg="bg-surface" boxShadow="sm" borderRadius="lg" {...props}>
      <Skeleton isLoaded={!loading}>
        <Stack
          spacing="5"
          px={{ base: "4", md: "6" }}
          py={{ base: "5", md: "6" }}
          divider={<Divider />}
        >
          {fields.map((field, index) => (
            <Stack key={field.id}>
              <Stack spacing="6" direction={{ base: "column", md: "row" }}>
                <FormControl
                  id="first_name"
                  isInvalid={
                    formState.errors.team_members?.[index]?.first_name !==
                    undefined
                  }
                >
                  <FormLabel>First Name</FormLabel>
                  <Input {...register(`team_members.${index}.first_name`)} />
                </FormControl>
                <FormControl
                  id="last_name"
                  isInvalid={
                    formState.errors.team_members?.[index]?.last_name !==
                    undefined
                  }
                >
                  <FormLabel>Last Name</FormLabel>
                  <Input {...register(`team_members.${index}.last_name`)} />
                </FormControl>
              </Stack>
              <Stack spacing="6" direction={{ base: "column", md: "row" }}>
                <FormControl
                  id="job_title"
                  isInvalid={
                    formState.errors.team_members?.[index]?.job_title !==
                    undefined
                  }
                >
                  <FormLabel>Job Title</FormLabel>
                  <Input {...register(`team_members.${index}.job_title`)} />
                </FormControl>
              </Stack>
              <FormControl
                id="bio"
                isInvalid={
                  formState.errors.team_members?.[index]?.bio !== undefined
                }
              >
                <FormLabel>Bio</FormLabel>
                <Textarea {...register(`team_members.${index}.bio`)} />
              </FormControl>
              <Stack direction={"row-reverse"}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    remove(index);
                  }}
                >
                  Remove
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    append({
                      bio: "",
                      first_name: "",
                      last_name: "",
                      job_title: "",
                    });
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Skeleton>
    </Box>
  );
}

export function TeamMemberSection(props: BoxProps) {
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      spacing={{ base: "5", lg: "8" }}
      justify="space-between"
    >
      <Stack spacing={4}>
        <Box flexShrink={0}>
          <Text fontSize="lg" fontWeight="medium">
            Team
          </Text>
          <Text color="fg.muted" fontSize="sm">
            Manage Team Members.
          </Text>
        </Box>
      </Stack>

      <TeamMemberCard w={{ lg: "xl" }} />
    </Stack>
  );
}

export interface HourRowProps {
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export function OpeningHourRow() {
  const { formState, register, control } =
    useFormContext<PracticeSummaryFormType>();
  const { fields, remove, insert, update } = useFieldArray({
    control,
    name: "opening_hours",
  });
  const { loading } = useLoading();

  return (
    <Flex
      as="form"
      bg="bg-surface"
      boxShadow="sm"
      borderRadius="lg"
      justify={"center"}
      align={"center"}
      w={{ lg: "xl" }}
    >
      <Skeleton isLoaded={!loading}>
        <Stack
          spacing="6"
          direction={"column"}
          align={"center"}
          justify={"center"}
          p={{ base: "4", md: "6" }}
          maxW="xl"
          divider={<Divider />}
        >
          {fields.map((field, index) => (
            <Stack
              direction={{
                base: "column",
                sm: "column",
                md: "row",
              }}
              align={"center"}
              key={field.id}
              justify={"space-between"}
              w={"100%"}
              spacing={{ base: "4", md: "12" }}
            >
              <Stack direction={"row"}>
                <Text>{moment.weekdays(field.day_of_week)}</Text>
                <FormControl display="flex" alignItems="center">
                  <Switch
                    id="is_closed"
                    {...register(`opening_hours.${index}.is_closed`)}
                    onChange={(e) => {
                      const value = e.target.checked;
                      update(index, {
                        ...field,
                        is_closed: value,
                      });
                    }}
                  />
                  <FormLabel htmlFor="is_open" mb="0" ml={4} mr="0">
                    Closed
                  </FormLabel>
                </FormControl>
              </Stack>
              <Stack direction={"row"} maxW={"18rem"}>
                <FormControl
                  id="start_time"
                  isInvalid={
                    formState.errors.opening_hours?.[index]?.start_time !==
                    undefined
                  }
                >
                  <FormLabel>Opens at</FormLabel>
                  <Input {...register(`opening_hours.${index}.start_time`)} />
                </FormControl>
                <Flex>
                  <Text marginTop={"2rem"}>-</Text>
                </Flex>

                <FormControl
                  id="end_time"
                  isInvalid={
                    formState.errors.opening_hours?.[index]?.end_time !==
                    undefined
                  }
                >
                  <FormLabel>Closes at</FormLabel>
                  <Input {...register(`opening_hours.${index}.end_time`)} />
                </FormControl>
                <Stack direction={"row"} pt={"1.6rem"}>
                  <IconButton
                    variant={"outline"}
                    size={"md"}
                    aria-label="add hour"
                    icon={<FiPlus fontSize="1.25rem" />}
                    onClick={() => {
                      insert(index + 1, {
                        id: undefined,
                        day_of_week: field.day_of_week,
                        start_time: "13:00",
                        end_time: "14:00",
                        created_at: undefined,
                        updated_at: undefined,
                        is_closed: true,
                      });
                    }}
                  />
                  <IconButton
                    variant={"outline"}
                    size={"md"}
                    aria-label="remove hour"
                    icon={<FiMinus fontSize="1.25rem" />}
                    isDisabled={
                      fields.filter((f) => f.day_of_week === field.day_of_week)
                        .length === 1
                    }
                    onClick={() => {
                      const day = field.day_of_week;
                      const atLeastOneHour =
                        fields.filter((field) => field.day_of_week === day)
                          .length > 1;
                      if (atLeastOneHour) remove(index);
                    }}
                  />
                </Stack>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Skeleton>
    </Flex>
  );
}

export function OpeningHourSection(props: BoxProps) {
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      spacing={{ base: "5", lg: "8" }}
      justify="space-between"
    >
      <Stack spacing={4}>
        <Box flexShrink={0}>
          <Text fontSize="lg" fontWeight="medium">
            Opening Hours
          </Text>
          <Text color="fg.muted" fontSize="sm">
            Manage Opening Hours.
          </Text>
        </Box>
      </Stack>

      <OpeningHourRow />
    </Stack>
  );
}

export function ContactOptionCard() {
  const { formState, register, control } =
    useFormContext<PracticeSummaryFormType>();
  const { fields, remove, insert, append } = useFieldArray({
    control,
    name: "contact_options",
  });
  const { loading } = useLoading();

  return (
    <Flex
      as="form"
      bg="bg-surface"
      boxShadow="sm"
      borderRadius="lg"
      justify={"center"}
      align={"center"}
      w={{ lg: "xl" }}
      px={{ base: "4", md: "6" }}
      py={{ base: "5", md: "6" }}
    >
      <Skeleton isLoaded={!loading} w={"100%"}>
        {fields.length > 0 ? (
          <Stack gap={4} divider={<Divider />} w={"100%"}>
            {fields.map((field, index) => (
              <Stack key={field.id} direction={"column"} w={"100%"}>
                <Stack direction={"row"}>
                  <FormControl
                    id="href_type"
                    isInvalid={
                      formState.errors.contact_options?.[index]?.href_type !==
                      undefined
                    }
                  >
                    <FormLabel>Type</FormLabel>
                    <Select
                      placeholder="Select type"
                      {...register(`contact_options.${index}.href_type`)}
                    >
                      <option value="tel">Phone Number</option>
                      <option value="email">Email</option>
                    </Select>
                  </FormControl>
                  <FormControl
                    id="name"
                    isInvalid={
                      formState.errors.contact_options?.[index]?.name !==
                      undefined
                    }
                  >
                    <FormLabel>Name</FormLabel>
                    <Input {...register(`contact_options.${index}.name`)} />
                  </FormControl>
                </Stack>

                <Stack direction={"row"}>
                  <FormControl
                    id="value"
                    isInvalid={
                      formState.errors.contact_options?.[index]?.value !==
                      undefined
                    }
                  >
                    <FormLabel>Value</FormLabel>
                    <Input {...register(`contact_options.${index}.value`)} />
                  </FormControl>
                  <Stack direction={"row"} pt={"1.6rem"}>
                    <IconButton
                      variant={"outline"}
                      size={"md"}
                      aria-label="add contact option"
                      icon={<FiPlus fontSize="1.25rem" />}
                      onClick={() => {
                        insert(index + 1, {
                          href_type: "",
                          value: "",
                          name: "",
                        });
                      }}
                    />
                    <IconButton
                      variant={"outline"}
                      size={"md"}
                      aria-label="remove hour"
                      icon={<FiMinus fontSize="1.25rem" />}
                      onClick={() => {
                        remove(index);
                      }}
                    />
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Stack>
            <Button
              variant={"outline"}
              onClick={() => {
                append({
                  href_type: "",
                  value: "",
                  name: "",
                  created_at: undefined,
                  updated_at: undefined,
                  id: undefined,
                });
              }}
            >
              Add Conact
            </Button>
          </Stack>
        )}
      </Skeleton>
    </Flex>
  );
}

export function ContactOptionSection() {
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      spacing={{ base: "5", lg: "8" }}
      justify="space-between"
    >
      <Stack spacing={4}>
        <Box flexShrink={0}>
          <Text fontSize="lg" fontWeight="medium">
            Contact Options
          </Text>
          <Text color="fg.muted" fontSize="sm">
            Contact options for your practice.
          </Text>
        </Box>
      </Stack>
      <ContactOptionCard />
    </Stack>
  );
}

export function OpeningTimeExceptionCard() {
  const { formState, register, control } =
    useFormContext<PracticeSummaryFormType>();
  const { fields, remove, insert, update } = useFieldArray({
    control,
    name: "opening_time_exceptions",
  });
  const { loading } = useLoading();

  return (
    <Flex
      as="form"
      bg="bg-surface"
      boxShadow="sm"
      borderRadius="lg"
      justify={"center"}
      align={"center"}
      w={{ lg: "xl" }}
      px={{ base: "4", md: "6" }}
      py={{ base: "5", md: "6" }}
    >
      <Skeleton isLoaded={!loading}>
        <Stack gap={4} divider={<Divider />} w={"100%"}>
          {fields.map((field, index) => (
            <Stack key={field.id} direction={"column"} w={"100%"}>
              <Flex direction={"row"}>
                <FormControl
                  id="reason"
                  isInvalid={
                    formState.errors.opening_time_exceptions?.[index]
                      ?.reason !== undefined
                  }
                >
                  <FormLabel>Reason</FormLabel>
                  <Input
                    {...register(`opening_time_exceptions.${index}.reason`)}
                  />
                </FormControl>
                <FormControl
                  display="flex"
                  alignItems="center"
                  maxW="8rem"
                  mt={"1.5rem"}
                  ml={"1.5rem"}
                >
                  <Switch
                    id="is_closed"
                    {...register(`opening_time_exceptions.${index}.is_closed`)}
                    onChange={(e) => {
                      const value = e.target.checked;
                      update(index, {
                        ...field,
                        is_closed: value,
                      });
                    }}
                  />
                  <FormLabel htmlFor="is_open" mb="0" ml={4} mr="0">
                    Closed
                  </FormLabel>
                </FormControl>
              </Flex>
              <Stack direction={"row"}>
                <FormControl
                  id="start_date"
                  isInvalid={
                    formState.errors.opening_time_exceptions?.[index]
                      ?.start_datetime !== undefined
                  }
                >
                  <FormLabel>Start</FormLabel>
                  <Input
                    {...register(
                      `opening_time_exceptions.${index}.start_datetime`,
                    )}
                  />
                </FormControl>
                <FormControl
                  id="end_date"
                  isInvalid={
                    formState.errors.opening_time_exceptions?.[index]
                      ?.end_datetime !== undefined
                  }
                >
                  <FormLabel>End</FormLabel>
                  <Input
                    {...register(
                      `opening_time_exceptions.${index}.end_datetime`,
                    )}
                  />
                </FormControl>
                <Stack direction={"row"} pt={"1.6rem"}>
                  <IconButton
                    variant={"outline"}
                    size={"md"}
                    aria-label="add contact option"
                    icon={<FiPlus fontSize="1.25rem" />}
                    onClick={() => {
                      insert(index + 1, {
                        start_datetime: "",
                        end_datetime: "",
                        reason: "",
                        is_closed: false,
                      });
                    }}
                  />
                  <IconButton
                    variant={"outline"}
                    size={"md"}
                    aria-label="remove hour"
                    icon={<FiMinus fontSize="1.25rem" />}
                    onClick={() => {
                      remove(index);
                    }}
                  />
                </Stack>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Skeleton>
    </Flex>
  );
}

export function OpeningTimeExceptionSection() {
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      spacing={{ base: "5", lg: "8" }}
      justify="space-between"
    >
      <Stack spacing={4}>
        <Box flexShrink={0}>
          <Text fontSize="lg" fontWeight="medium">
            Opening Time Exceptions
          </Text>
          <Text color="fg.muted" fontSize="sm">
            Add extra opening hours or holidays.
          </Text>
        </Box>
      </Stack>
      <OpeningTimeExceptionCard />
    </Stack>
  );
}

export function NoticeCard() {
  const { formState, register, control } =
    useFormContext<PracticeSummaryFormType>();
  const { fields, remove, append, insert } = useFieldArray({
    control,
    name: "notices",
  });
  const { loading } = useLoading();

  return (
    <Flex
      as="form"
      bg="bg-surface"
      boxShadow="sm"
      borderRadius="lg"
      justify={"center"}
      align={"center"}
      w={{ lg: "xl" }}
      px={{ base: "4", md: "6" }}
      py={{ base: "5", md: "6" }}
    >
      <Skeleton isLoaded={!loading} w={"100%"}>
        {fields.length > 0 ? (
          <Stack gap={4} divider={<Divider />} w={"100%"}>
            {fields.map((field, index) => (
              <Stack key={field.id} direction={"column"} w={"100%"}>
                <Stack direction={"row"}>
                  <FormControl
                    id="title"
                    isInvalid={
                      formState.errors.notices?.[index]?.title !== undefined
                    }
                  >
                    <FormLabel>Title</FormLabel>
                    <Input
                      {...register(`notices.${index}.title`)}
                      placeholder="Notice title"
                    />
                  </FormControl>

                  <Stack direction={"row"} pt={"1.6rem"}>
                    <IconButton
                      variant={"outline"}
                      size={"md"}
                      aria-label="add contact option"
                      icon={<FiPlus fontSize="1.25rem" />}
                      onClick={() => {
                        insert(index + 1, {
                          description_markdown: "",
                          title: "",
                        });
                      }}
                    />
                    <IconButton
                      variant={"outline"}
                      size={"md"}
                      aria-label="remove hour"
                      icon={<FiMinus fontSize="1.25rem" />}
                      onClick={() => {
                        remove(index);
                      }}
                    />
                  </Stack>
                </Stack>
                <Stack>
                  <FormControl
                    id="description_markdown"
                    isInvalid={
                      formState.errors.notices?.[index]
                        ?.description_markdown !== undefined
                    }
                  >
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      {...register(`notices.${index}.description_markdown`)}
                      placeholder="Description"
                    />
                  </FormControl>
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Stack>
            <Button
              variant={"outline"}
              onClick={() => {
                append({
                  description_markdown: "",
                  title: "",
                  created_at: undefined,
                  updated_at: undefined,
                  id: undefined,
                });
              }}
            >
              Add Notice
            </Button>
          </Stack>
        )}
      </Skeleton>
    </Flex>
  );
}

export function NoticeSection() {
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      spacing={{ base: "5", lg: "8" }}
      justify="space-between"
    >
      <Stack spacing={4}>
        <Box flexShrink={0}>
          <Text fontSize="lg" fontWeight="medium">
            Notice Board Alerts
          </Text>
          <Text color="fg.muted" fontSize="sm">
            Send out a notices to your patients.
          </Text>
        </Box>
      </Stack>
      <NoticeCard />
    </Stack>
  );
}

export function FeatureFlagSection() {
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      spacing={{ base: "5", lg: "8" }}
      justify="space-between"
    >
      <Stack spacing={4}>
        <Box flexShrink={0}>
          <Text fontSize="lg" fontWeight="medium">
            Feature Flags
          </Text>
          <Text color="fg.muted" fontSize="sm">
            Toggle features on and off.
          </Text>
        </Box>
      </Stack>
      <FeatureFlagCard />
    </Stack>
  );
}

export function FeatureFlagCard() {
  const { formState, register, control } =
    useFormContext<PracticeSummaryFormType>();
  const { fields } = useFieldArray({
    control,
    name: "feature_flags",
  });
  const { loading } = useLoading();

  return (
    <Flex
      as="form"
      bg="bg-surface"
      boxShadow="sm"
      borderRadius="lg"
      justify={"center"}
      align={"center"}
      w={{ lg: "xl" }}
      px={{ base: "4", md: "6" }}
      py={{ base: "5", md: "6" }}
    >
      <Skeleton isLoaded={!loading} w={"100%"}>
        <Stack gap={4} divider={<Divider />}>
          {fields.map((field, index) => (
            <Stack
              key={field.id}
              direction={"column"}
              justify={"center"}
              align={"center"}
            >
              <Stack direction={"row"} gap={4}>
                <Stack>
                  <Text>{_.startCase(field.flag_id)}</Text>
                </Stack>
                <Stack direction={"row"}>
                  <FormControl
                    id="toggle"
                    isInvalid={
                      formState.errors.feature_flags?.[index]?.flag_value !==
                      undefined
                    }
                    mt={1}
                  >
                    <Checkbox
                      {...register(`feature_flags.${index}.flag_value`)}
                      placeholder="Toggle"
                    />
                  </FormControl>
                </Stack>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Skeleton>
    </Flex>
  );
}
