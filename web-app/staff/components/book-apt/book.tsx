import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  StackDivider,
  Text,
  Textarea,
  Center,
  CenterProps,
  HStack,
  Icon,
  Square,
  useColorModeValue,
  VStack,
  Box,
  BoxProps,
  Divider,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Input,
  Select,
  Skeleton,
} from "@chakra-ui/react";
import { FiUploadCloud } from "react-icons/fi";
import { RadioCard, RadioCardGroup } from "./radio";
import { GiJoint, GiStomach } from "react-icons/gi";
import { RiTempColdLine, RiMentalHealthFill } from "react-icons/ri";
import { FaLungs, FaToilet } from "react-icons/fa";
import { AiOutlineSkin } from "react-icons/ai";
import * as yup from "yup";
import { useMemo, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoading } from "../../state/loading";

const AptYupSchema = yup.object({
  id: yup.number(),
  symptoms: yup.string().required(),
  symptom_category: yup.string().required(),
  symptoms_duration_seconds: yup.number().required(),
});
export type AptFormType = yup.InferType<typeof AptYupSchema>;

export interface PatientSymptomsProps {
  onSubmit(): void;
}

export const Dropzone = (props: CenterProps) => (
  <Center
    borderWidth="1px"
    borderRadius="lg"
    px="6"
    py="4"
    bg={useColorModeValue("white", "gray.800")}
    {...props}
  >
    <VStack spacing="3">
      <Square size="10" bg="bg-subtle" borderRadius="lg">
        <Icon as={FiUploadCloud} boxSize="5" color="muted" />
      </Square>
      <VStack spacing="1">
        <HStack spacing="1" whiteSpace="nowrap">
          <Button variant="link" colorScheme="blue" size="sm">
            Click to upload
          </Button>
          <Text fontSize="sm" color="muted">
            or drag and drop
          </Text>
        </HStack>
        <Text fontSize="xs" color="muted">
          PNG, JPG or GIF up to 2MB
        </Text>
      </VStack>
    </VStack>
  </Center>
);

export const PersonalInfoCard = (props: BoxProps) => {
  const { control } = useFormContext<AptFormType>();
  const { loading } = useLoading();
  return (
    <Box
      as="form"
      bg="bg-surface"
      boxShadow={useColorModeValue("sm", "sm-dark")}
      borderRadius="lg"
      w={"100%"}
      {...props}
    >
      <Skeleton isLoaded={!loading}>
        <Stack
          spacing="5"
          px={{ base: "4", md: "6" }}
          py={{ base: "5", md: "6" }}
          w={"100%"}
        >
          <Controller
            control={control}
            name="symptom_category"
            render={({ field: { onChange } }) => (
              <RadioCardGroup
                defaultValue="one"
                spacing="3"
                onChange={onChange}
              >
                {[
                  {
                    title: "Muscles and joints",
                    subtitle:
                      "Back, neck, shoulder or other muscle and joint problems.",
                    icon: <GiJoint />,
                  },
                  {
                    title: "Cold and flu",
                    subtitle: "Runny nose, fever, aching, sore throat.",
                    icon: <RiTempColdLine />,
                  },
                  {
                    title: "Cough",
                    subtitle: "Dry, tickly or chest cough",
                    icon: <FaLungs />,
                  },
                  {
                    title: "Mental Health",
                    subtitle: "Feeling stressed, anxious or depressed.",
                    icon: <RiMentalHealthFill />,
                  },
                  {
                    title: "Skin Problem",
                    subtitle:
                      "Rashes, acne, eczema, infections, lumps or moles.",
                    icon: <AiOutlineSkin />,
                  },
                  {
                    title: "Stomach ache or pain",
                    subtitle:
                      "Food poisoning, feeling or being sick, diarrhoea or bloating.",
                    icon: <GiStomach />,
                  },
                  {
                    title: "Urine problem",
                    subtitle:
                      "Pain or stinging when urinating, needing to urinate often.",
                    icon: <FaToilet />,
                  },
                  {
                    title: "Other",
                    subtitle: "",
                  },
                ].map((option) => (
                  <RadioCard key={option.title} value={option.title}>
                    <Flex alignItems={"center"} gap={5}>
                      <Text
                        color="emphasized"
                        fontWeight="medium"
                        fontSize="lg"
                      >
                        {option.icon}
                      </Text>

                      <Flex direction={"column"}>
                        <Text
                          color="emphasized"
                          fontWeight="medium"
                          fontSize="sm"
                        >
                          {option.title}
                        </Text>
                        <Text color="muted" fontSize="sm">
                          {option.subtitle}
                        </Text>
                      </Flex>
                    </Flex>
                  </RadioCard>
                ))}
              </RadioCardGroup>
            )}
          />
        </Stack>
      </Skeleton>
    </Box>
  );
};

interface DurationInputProps {
  onChange: (duration: number) => void;
}

function DurationInput({ onChange }: DurationInputProps) {
  const [unit, setUnit] = useState("days");
  const [duration, setDuration] = useState(1);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  useMemo(() => {
    let seconds = 0;
    switch (unit) {
      case "hours":
        seconds = duration * 60 * 60;
        break;
      case "days":
        seconds = duration * 60 * 60 * 24;
        break;
      case "weeks":
        seconds = duration * 60 * 60 * 24 * 7;
        break;
      case "months":
        seconds = duration * 60 * 60 * 24 * 30;
        break;
      case "years":
        seconds = duration * 60 * 60 * 24 * 365;
        break;
    }
    setDurationSeconds(seconds);
  }, [unit, duration]);

  useMemo(() => {
    onChange(durationSeconds);
  }, [durationSeconds, onChange]);

  return (
    <FormControl>
      <FormLabel>Symptoms duration in {unit}</FormLabel>

      <Stack direction={"row"}>
        <Input
          type="number"
          placeholder={`Duration in ${unit}`}
          value={duration}
          onChange={(e: any) => {
            setDuration(e.target.value);
          }}
        />
        <Select
          value={unit}
          onChange={(e: any) => {
            setUnit(e.target.value);
          }}
        >
          <option value="hours">Hours</option>
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </Select>
      </Stack>
      <FormHelperText color="subtle">
        How long have you had the symptoms for.
      </FormHelperText>
    </FormControl>
  );
}
interface ProfileCardProps {
  onSubmit: () => void;
}
export const ProfileCard = ({ onSubmit }: ProfileCardProps) => {
  const { formState, register, control } = useFormContext<AptFormType>();
  const { loading } = useLoading();
  return (
    <Box
      bg="bg-surface"
      boxShadow={useColorModeValue("sm", "sm-dark")}
      borderRadius="lg"
      flex="1"
      maxW={{
        base: "",
        lg: "xl",
      }}
    >
      <Skeleton isLoaded={!loading}>
        <Stack
          spacing="5"
          px={{ base: "4", md: "6" }}
          py={{ base: "5", md: "6" }}
        >
          <FormControl
            id="symptoms"
            isInvalid={formState.errors.symptoms !== undefined}
          >
            <FormLabel>Symptoms</FormLabel>
            <Textarea
              rows={5}
              resize="none"
              maxLength={1000}
              {...register("symptoms")}
            />
            <FormHelperText color="subtle">
              Write a short description of symptoms here.
            </FormHelperText>
          </FormControl>
          <Controller
            control={control}
            name="symptoms_duration_seconds"
            render={({ field: { onChange } }) => (
              <DurationInput onChange={onChange} />
            )}
          />
        </Stack>
        <Divider />
        <Flex direction="row-reverse" py="4" px={{ base: "4", md: "6" }}>
          <Button type="submit" variant="primary" onClick={onSubmit}>
            Next
          </Button>
        </Flex>
      </Skeleton>
    </Box>
  );
};

export function PatientSymptoms({ onSubmit }: PatientSymptomsProps) {
  return (
    <Stack spacing="5" divider={<StackDivider />}>
      <Stack
        direction={{ base: "column", lg: "row" }}
        spacing={{ base: "5", lg: "8" }}
        justify="space-between"
      >
        <Box flexShrink={0}>
          <Text fontSize="lg" fontWeight="medium">
            What can we help with?
          </Text>
          <Text color="muted" fontSize="sm">
            Your type of symptoms.
          </Text>
        </Box>
        <PersonalInfoCard
          maxW={{
            base: "",
            lg: "xl",
          }}
        />
      </Stack>
      <Stack
        direction={{ base: "column", lg: "row" }}
        spacing={{ base: "5", lg: "8" }}
        justify="space-between"
      >
        <Box flexShrink={0}>
          <Text fontSize="lg" fontWeight="medium">
            Your Symptoms
          </Text>
          <Text color="muted" fontSize="sm">
            Please provide a description of your symptoms.
          </Text>
        </Box>
        <ProfileCard onSubmit={onSubmit} />
      </Stack>
    </Stack>
  );
}

interface BookAptFormProps {
  onSubmit: (data: AptFormType) => void;
}

export function BookAptForm({ onSubmit }: BookAptFormProps) {
  const methods = useForm({
    resolver: yupResolver(AptYupSchema),
  });
  return (
    <Stack w={"100%"} divider={<Divider />}>
      <Box
        as="section"
        bg="bg.surface"
        pt={{ base: "4", md: "8" }}
        pb={{ base: "6", md: "6" }}
      >
        <Container>
          <Breadcrumb mb={4}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink href={`/appointments`}>
                Appointments
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Create</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                Book Appointment
              </Heading>
              <Text color="fg.muted">
                Please fill in details below to book an appointment.
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container py={4}>
        <FormProvider {...methods}>
          <PatientSymptoms
            onSubmit={methods.handleSubmit(
              (data) => {
                onSubmit(data as AptFormType);
              },
              (err) => {
                console.log(err);
              },
            )}
          />
        </FormProvider>
      </Container>
    </Stack>
  );
}
