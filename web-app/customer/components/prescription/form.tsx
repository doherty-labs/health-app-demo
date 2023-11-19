import {
  Flex,
  Stack,
  Box,
  Text,
  Container,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  StackDivider,
  Button,
  IconButton,
  Skeleton,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { FiMinus, FiPlus } from "react-icons/fi";
import * as yup from "yup";
import { useLoading } from "../state/loading";
import { usePlacesWidget } from "react-google-autocomplete";
import _ from "lodash";
import { LegacyRef } from "react";

const PrescriptionYupSchema = yup.object({
  id: yup.number(),
  created_at: yup.string(),
  updated_at: yup.string(),
  items: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required(),
        quantity: yup.number().default(1),
      }),
    )
    .default([])
    .required(),
  patient_id: yup.number(),
  practice_id: yup.number(),
  state: yup.string(),
  pharmacy: yup.object({
    id: yup.number(),
    created_at: yup.string(),
    updated_at: yup.string(),
    name: yup.string().required(),
    address_line_1: yup.string().required(),
    address_line_2: yup.string().default(""),
    city: yup.string().required(),
    state: yup.string().required(),
    zip_code: yup.string().required(),
    country: yup.string().required(),
  }),
});
export type PrescriptionFormType = yup.InferType<typeof PrescriptionYupSchema>;

export function PrescriptionNamesFormComponent() {
  const { formState, register, control } =
    useFormContext<PrescriptionFormType>();
  const { fields, remove, insert } = useFieldArray({
    control,
    name: "items",
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
      w={"100%"}
    >
      <Skeleton isLoaded={!loading} w={"100%"}>
        <Stack
          spacing="6"
          direction={"column"}
          align={"center"}
          justify={"center"}
          p={{ base: "4", md: "6" }}
          divider={<Divider />}
          w={"100%"}
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
              <Stack direction={"row"} w={"100%"}>
                <FormControl
                  id="name"
                  isInvalid={
                    formState.errors.items?.[index]?.name !== undefined
                  }
                >
                  <FormLabel>Prescription Name</FormLabel>
                  <Input
                    {...register(`items.${index}.name`)}
                    autoComplete="off"
                  />
                </FormControl>
                <FormControl
                  id="qty"
                  maxW={"6rem"}
                  isInvalid={
                    formState.errors.items?.[index]?.quantity !== undefined
                  }
                >
                  <FormLabel>Quantity</FormLabel>
                  <Input
                    {...register(`items.${index}.quantity`)}
                    autoComplete="off"
                    type="number"
                  />
                </FormControl>

                <Stack direction={"row"} pt={"1.6rem"}>
                  <IconButton
                    variant={"outline"}
                    size={"md"}
                    aria-label="add name"
                    icon={<FiPlus fontSize="1.25rem" />}
                    onClick={() => {
                      insert(index + 1, {
                        name: "",
                        quantity: 1,
                      });
                    }}
                  />
                  <IconButton
                    variant={"outline"}
                    size={"md"}
                    aria-label="remove name"
                    icon={<FiMinus fontSize="1.25rem" />}
                    isDisabled={index === 0}
                    onClick={() => {
                      if (index === 0) return;
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

export function PrescriptionPharmacyFormComponent() {
  const { loading } = useLoading();
  const { formState, register, setValue } =
    useFormContext<PrescriptionFormType>();
  const { ref } = usePlacesWidget<any>({
    apiKey: process.env.NEXT_PUBLIC_GMAPS_API_KEY,
    onPlaceSelected: (place: any) => {
      if (!place) return;
      const mappedLoc: any = _.chain(place.address_components)
        .map((component) => {
          const type = component.types[0];
          const value = component.long_name;
          return { [type]: value };
        })
        .reduce((acc, curr) => {
          return { ...acc, ...curr };
        })
        .value();

      setValue("pharmacy", {
        name: place.name,
        address_line_1: mappedLoc.street_number + " " + mappedLoc.route,
        address_line_2: mappedLoc.subpremise || "",
        city: mappedLoc.administrative_area_level_2,
        state: mappedLoc.administrative_area_level_1,
        zip_code: mappedLoc.postal_code,
        country: mappedLoc.country,
      });
      if (ref.current) {
        ref.current.value = place.name;
      }
    },
    options: {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "uk" },
      fields: ["address_components", "name"],
    },
  });
  return (
    <Flex
      as="form"
      bg="bg-surface"
      boxShadow="sm"
      borderRadius="lg"
      justify={"center"}
      align={"center"}
      w={"100%"}
    >
      <Skeleton isLoaded={!loading} w={"100%"}>
        <Stack
          spacing="5"
          px={{ base: "4", md: "6" }}
          py={{ base: "5", md: "6" }}
        >
          <Stack spacing="6" direction={"column"}>
            <FormControl
              id="pharmacy-name"
              isInvalid={formState.errors.pharmacy?.name !== undefined}
            >
              <FormLabel>Pharmacy Name</FormLabel>
              <Input
                ref={ref as unknown as LegacyRef<HTMLInputElement>}
                onChange={(e) => {
                  setValue("pharmacy.name", e.target.value);
                }}
              />
            </FormControl>
            <FormControl
              id="add1"
              isInvalid={
                formState.errors.pharmacy?.address_line_1 !== undefined
              }
            >
              <FormLabel>Address Line 1</FormLabel>
              <Input {...register("pharmacy.address_line_1")} />
            </FormControl>
            <FormControl
              id="add2"
              isInvalid={
                formState.errors.pharmacy?.address_line_2 !== undefined
              }
            >
              <FormLabel>Address Line 2</FormLabel>
              <Input {...register("pharmacy.address_line_2")} />
            </FormControl>
          </Stack>
          <Stack spacing="6" direction={{ base: "column", md: "row" }}>
            <FormControl
              id="zip"
              isInvalid={formState.errors.pharmacy?.zip_code !== undefined}
            >
              <FormLabel>Post Code</FormLabel>
              <Input {...register("pharmacy.zip_code")} />
            </FormControl>
            <FormControl
              id="city"
              isInvalid={formState.errors.pharmacy?.city !== undefined}
            >
              <FormLabel>City</FormLabel>
              <Input {...register("pharmacy.city")} />
            </FormControl>
          </Stack>
          <Stack direction={"row"}>
            <FormControl
              id="state"
              isInvalid={formState.errors.pharmacy?.state !== undefined}
            >
              <FormLabel>Province / County</FormLabel>
              <Input {...register("pharmacy.state")} />
            </FormControl>
            <FormControl
              id="country"
              isInvalid={formState.errors.pharmacy?.country !== undefined}
            >
              <FormLabel>Country</FormLabel>
              <Input {...register("pharmacy.country")} />
            </FormControl>
          </Stack>
        </Stack>
      </Skeleton>
    </Flex>
  );
}

export interface PrescriptionFormProps {
  practiceSlug: string;
  practiceName: string;
  onSubmit: (data: PrescriptionFormType) => void;
}

export function PrescriptionForm({
  practiceSlug,
  practiceName,
  onSubmit,
}: PrescriptionFormProps) {
  const methods = useForm({
    resolver: yupResolver(PrescriptionYupSchema),
    defaultValues: {
      items: [{ name: "", quantity: 1 }],
    },
  });
  return (
    <FormProvider {...methods}>
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
                <BreadcrumbLink href={`/practice/${practiceSlug}`}>
                  {practiceName}
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>Request Prescription</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            <Stack
              spacing="4"
              direction={{ base: "column", md: "row" }}
              justify="space-between"
            >
              <Stack spacing="1">
                <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                  Request Prescription
                </Heading>
                <Text color="fg.muted">
                  Please fill in details below to request a prescription.
                </Text>
              </Stack>
              <Stack
                direction={{ base: "row", sm: "row", md: "row" }}
                spacing={"3"}
                gap={"1"}
              >
                <Button
                  order={{ base: "2", md: "1" }}
                  variant="primary"
                  onClick={() => {
                    methods.handleSubmit(onSubmit)();
                  }}
                >
                  Submit
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
        <Container pt={4} pb={12}>
          <Stack spacing="5" divider={<StackDivider />}>
            <Stack
              direction={{ base: "column", lg: "row" }}
              spacing={{ base: "5", lg: "8" }}
              justify="space-between"
            >
              <Box flexShrink={0}>
                <Text fontSize="lg" fontWeight="medium">
                  Prescription Name(s)
                </Text>
                <Text color="muted" fontSize="sm">
                  Provide name of your prescriptions.
                </Text>
              </Box>
              <Flex
                w={{
                  base: "100%",
                  lg: "xl",
                }}
              >
                <PrescriptionNamesFormComponent />
              </Flex>
            </Stack>
            <Stack
              direction={{ base: "column", lg: "row" }}
              spacing={{ base: "5", lg: "8" }}
              justify="space-between"
            >
              <Box flexShrink={0}>
                <Text fontSize="lg" fontWeight="medium">
                  Collection Pharmacy
                </Text>
                <Text color="muted" fontSize="sm">
                  Provide details of pharmacy you want to collect from.
                </Text>
              </Box>
              <Flex
                w={{
                  base: "100%",
                  lg: "xl",
                }}
              >
                <PrescriptionPharmacyFormComponent />
              </Flex>
            </Stack>
          </Stack>
        </Container>
      </Stack>
    </FormProvider>
  );
}
