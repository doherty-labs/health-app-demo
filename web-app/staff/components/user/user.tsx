import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Skeleton,
  Stack,
} from "@chakra-ui/react";
import * as yup from "yup";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoading } from "../../state/loading";

const StaffYupSchema = yup.object({
  id: yup.number(),
  practice_id: yup.number(),
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  job_title: yup.string().required(),
  bio: yup.string(),
  email: yup.string().required(),
});
export type StaffFormType = yup.InferType<typeof StaffYupSchema>;

export interface StaffInfoCardProps {
  onSubmit(): void;
}

export const StaffInfoCard = ({ onSubmit }: StaffInfoCardProps) => {
  const { formState, register } = useFormContext<StaffFormType>();
  const { loading } = useLoading();

  return (
    <Skeleton isLoaded={!loading} w={"100%"}>
      <Box
        as="form"
        bg="bg-surface"
        boxShadow="sm"
        borderRadius="lg"
        w={{ lg: "2xl" }}
      >
        <Stack
          spacing="5"
          px={{ base: "4", md: "6" }}
          py={{ base: "5", md: "6" }}
        >
          <Stack spacing="6" direction={{ base: "column", md: "row" }}>
            <FormControl
              id="firstName"
              isInvalid={formState.errors.first_name !== undefined}
            >
              <FormLabel>Forename</FormLabel>
              <Input {...register("first_name")} />
            </FormControl>
            <FormControl
              id="lastName"
              isInvalid={formState.errors.last_name !== undefined}
            >
              <FormLabel>Surname</FormLabel>
              <Input {...register("last_name")} />
            </FormControl>
          </Stack>
          <Stack spacing="6" direction={{ base: "column", md: "row" }}>
            <FormControl
              id="email"
              isInvalid={formState.errors.email !== undefined}
            >
              <FormLabel>Email</FormLabel>
              <Input readOnly={true} {...register("email")} />
            </FormControl>
          </Stack>
          <Stack spacing="6" direction={{ base: "column", md: "row" }}>
            <FormControl
              id="job_title"
              isInvalid={formState.errors.job_title !== undefined}
            >
              <FormLabel>Job Title</FormLabel>
              <Input {...register("job_title")} />
            </FormControl>
            <FormControl
              id="bio"
              isInvalid={formState.errors.bio !== undefined}
            >
              <FormLabel>Bio</FormLabel>
              <Input {...register("bio")} />
            </FormControl>
          </Stack>
        </Stack>
        <Divider />
        <Flex direction="row-reverse" py="4" px={{ base: "4", md: "6" }}>
          <Button
            variant="primary"
            onClick={() => {
              onSubmit();
            }}
          >
            Save
          </Button>
        </Flex>
      </Box>
    </Skeleton>
  );
};

export interface StaffInfoFormProps {
  onSubmit: (data: StaffFormType) => void;
  defaultValues?: StaffFormType;
}

export const UserInfoForm = ({
  onSubmit,
  defaultValues,
}: StaffInfoFormProps) => {
  const dv: any = defaultValues;
  const methods = useForm({
    resolver: yupResolver(StaffYupSchema),
    defaultValues: dv,
  });
  return (
    <Flex>
      <FormProvider {...methods}>
        <StaffInfoCard
          onSubmit={methods.handleSubmit(
            (data) => {
              onSubmit(data as StaffFormType);
            },
            (err) => {
              console.log(err);
            },
          )}
        />
      </FormProvider>
    </Flex>
  );
};
