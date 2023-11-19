import * as yup from "yup";
import { useMemo, useState } from "react";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Skeleton,
  Stack,
} from "@chakra-ui/react";
import { Controller, useFormContext } from "react-hook-form";
import { useLoading } from "../../state/loading";
import moment, { unitOfTime } from "moment";

export const AvailYupSchema = yup.object({
  id: yup.number(),
  target_date: yup.string().required("Date is required"),
  start_time: yup.string().required("Start time is required"),
  end_time: yup.string().required("End time is required"),
  schedule_release_time_delta: yup
    .number()
    .required("Schedule time is required"),
});
export type AvailFormType = yup.InferType<typeof AvailYupSchema>;

interface DurationInputProps {
  onChange: (duration: number) => void;
  value?: number;
}

function DurationInput({ onChange, value }: DurationInputProps) {
  const [unit, setUnit] = useState<unitOfTime.DurationConstructor>("days");
  const [duration, setDuration] = useState<number>(1);
  const [durationSeconds, setDurationSeconds] = useState<number>();

  useMemo(() => {
    if (!durationSeconds) return;
    onChange(durationSeconds);
  }, [durationSeconds, onChange]);

  useMemo(() => {
    if (!value) return;
    const duration = value / 60 / 60 / 24;
    setDuration(duration);
    setUnit("days");
    setDurationSeconds(value);
  }, [value]);

  return (
    <FormControl>
      <FormLabel>Schedule release {unit} prior</FormLabel>
      <Stack direction={"row"}>
        <Input
          type="number"
          placeholder={`Duration in ${unit}`}
          value={duration}
          onChange={(e: any) => {
            const duration = Number(e.target.value);
            setDuration(duration);
            const seconds = moment.duration(duration, unit).asSeconds();
            setDurationSeconds(seconds);
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
        How long before the start time should this be released for booking.
      </FormHelperText>
    </FormControl>
  );
}

export function AvailabilityForm() {
  const { formState, register, control } = useFormContext<AvailFormType>();
  const { loading } = useLoading();
  return (
    <Skeleton isLoaded={!loading}>
      <Stack spacing="5" px={{ base: "4", md: "6" }} py={2}>
        <FormControl
          id="target_date"
          isInvalid={formState.errors.start_time !== undefined}
        >
          <FormLabel>Date</FormLabel>
          <Input {...register("target_date")} placeholder="HH:MM" />
        </FormControl>
        <FormControl
          id="start_time"
          isInvalid={formState.errors.start_time !== undefined}
        >
          <FormLabel>Start time (HH:MM)</FormLabel>
          <Input {...register("start_time")} placeholder="HH:MM" />
          <FormHelperText color="subtle">
            Start time of appointment
          </FormHelperText>
        </FormControl>
        <FormControl
          id="end_time"
          isInvalid={formState.errors.start_time !== undefined}
        >
          <FormLabel>End time (HH:MM)</FormLabel>
          <Input {...register("end_time")} placeholder="HH:MM" />
          <FormHelperText color="subtle">
            End time of appointment
          </FormHelperText>
        </FormControl>
        <Controller
          control={control}
          name="schedule_release_time_delta"
          defaultValue={60 * 60 * 24}
          render={({ field: { onChange, value } }) => (
            <DurationInput onChange={onChange} value={value} />
          )}
        />
      </Stack>
    </Skeleton>
  );
}
