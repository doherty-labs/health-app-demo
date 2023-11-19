import {
  Divider,
  Stack,
  Box,
  Container,
  Heading,
  Text,
} from "@chakra-ui/react";
import _ from "lodash";
import moment from "moment";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { components } from "../../schemas/api-types";

type AppointmentAnalytics = components["schemas"]["AppointmentAnalyticsSchema"];
type PrescriptionAnalytics =
  components["schemas"]["PrescriptionAnalyticsSchema"];

export interface DashboardProps {
  aptAnalytics?: AppointmentAnalytics;
  prescAnalytics?: PrescriptionAnalytics;
}

export function DashboardHome({
  aptAnalytics,
  prescAnalytics,
}: DashboardProps) {
  return (
    <Stack overflow={"hidden"} divider={<Divider />}>
      <Box
        as="section"
        bg="bg.surface"
        pt={{ base: "4", md: "8" }}
        pb={{ base: "6", md: "6" }}
      >
        <Container>
          <Stack
            spacing="4"
            direction={{ base: "column", md: "row" }}
            justify="space-between"
          >
            <Stack spacing="1">
              <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
                Dashboard
              </Heading>
              <Text color="fg.muted">Get an overview of your practice.</Text>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container pt={4} px={8}>
        <Stack spacing={1}>
          <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
            Appointment Analytics
          </Heading>
          <Text color="fg.muted">Get insights into your appointments.</Text>
        </Stack>
        <Stack direction={"column"} gap={4} divider={<Divider />} py={6}>
          <Stack
            p={4}
            bgColor={"bg-surface"}
            borderRadius={"lg"}
            boxShadow="sm"
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                title: {
                  text: "Count of Appointment Requests",
                  align: "left",
                },
                subtitle: {
                  text: "Measure of how many appointments are requested by patients",
                  align: "left",
                },
                yAxis: {
                  title: {
                    text: "Count of Appointments",
                  },
                },
                xAxis: {
                  type: "datetime",
                },
                legend: {
                  layout: "vertical",
                  align: "right",
                  verticalAlign: "middle",
                },
                credits: {
                  enabled: false,
                },
                series: [
                  {
                    name: "Appointments",
                    data: _.chain(aptAnalytics?.overall_count)
                      .map((count) => {
                        return [moment(count.date).valueOf(), count.value];
                      })
                      .value(),
                  },
                ],
                responsive: {
                  rules: [
                    {
                      condition: {
                        maxWidth: 500,
                      },
                      chartOptions: {
                        legend: {
                          layout: "horizontal",
                          align: "center",
                          verticalAlign: "bottom",
                        },
                      },
                    },
                  ],
                },
              }}
            />
          </Stack>
          <Stack
            p={4}
            bgColor={"bg-surface"}
            borderRadius={"lg"}
            boxShadow="sm"
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                title: {
                  text: "Appointments by State",
                  align: "left",
                },
                subtitle: {
                  text: "Pie chart of appointments by state",
                  align: "left",
                },
                chart: {
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false,
                  type: "pie",
                },
                credits: {
                  enabled: false,
                },
                accessibility: {
                  point: {
                    valueSuffix: "%",
                  },
                },
                plotOptions: {
                  pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    dataLabels: {
                      enabled: true,
                      format: "<b>{point.name}</b>: {point.percentage:.1f} %",
                    },
                  },
                },
                series: [
                  {
                    name: "States",
                    colorByPoint: true,
                    data: _.chain(aptAnalytics?.count_by_state)
                      .map((count) => {
                        return {
                          name: _.startCase(count.by),
                          y: count.value,
                        };
                      })
                      .value(),
                  },
                ],
              }}
            />
          </Stack>
          <Stack
            p={4}
            bgColor={"bg-surface"}
            borderRadius={"lg"}
            boxShadow="sm"
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                title: {
                  text: "Average wait time by state (hours)",
                  align: "left",
                },
                subtitle: {
                  text: "Bar chart of average wait time by state",
                  align: "left",
                },
                xAxis: {
                  categories: _.chain(aptAnalytics?.avg_time_in_state)
                    .map((count) => {
                      return _.startCase(count.by);
                    })
                    .value(),
                  crosshair: true,
                  accessibility: {
                    description: "States",
                  },
                },
                tooltip: {
                  valueSuffix: " hours",
                },
                chart: {
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false,
                  type: "column",
                },
                plotOptions: {
                  column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                  },
                },
                credits: {
                  enabled: false,
                },
                series: [
                  {
                    name: "States",
                    colorByPoint: true,
                    data: _.chain(aptAnalytics?.avg_time_in_state)
                      .map((count) => {
                        const h = moment
                          .duration(count.value, "seconds")
                          .asHours();
                        return {
                          name: _.startCase(count.by),
                          y: _.round(h, 2),
                        };
                      })
                      .value(),
                  },
                ],
              }}
            />
          </Stack>
        </Stack>
      </Container>
      <Container pt={4} pb={"4rem"} px={8}>
        <Stack spacing={1}>
          <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
            Prescription Analytics
          </Heading>
          <Text color="fg.muted">Get insights into your prescriptions.</Text>
        </Stack>
        <Stack direction={"column"} gap={4} divider={<Divider />} py={6}>
          <Stack
            p={4}
            bgColor={"bg-surface"}
            borderRadius={"lg"}
            boxShadow="sm"
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                title: {
                  text: "Count of Prescription Requests",
                  align: "left",
                },
                subtitle: {
                  text: "Measure of how many prescriptions are requested by patients",
                  align: "left",
                },
                yAxis: {
                  title: {
                    text: "Count of Prescription",
                  },
                },
                xAxis: {
                  type: "datetime",
                },
                legend: {
                  layout: "vertical",
                  align: "right",
                  verticalAlign: "middle",
                },
                credits: {
                  enabled: false,
                },
                series: [
                  {
                    name: "Prescriptions",
                    data: _.chain(prescAnalytics?.overall_count)
                      .map((count) => {
                        return [moment(count.date).valueOf(), count.value];
                      })
                      .value(),
                  },
                ],
                responsive: {
                  rules: [
                    {
                      condition: {
                        maxWidth: 500,
                      },
                      chartOptions: {
                        legend: {
                          layout: "horizontal",
                          align: "center",
                          verticalAlign: "bottom",
                        },
                      },
                    },
                  ],
                },
              }}
            />
          </Stack>
          <Stack
            p={4}
            bgColor={"bg-surface"}
            borderRadius={"lg"}
            boxShadow="sm"
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                title: {
                  text: "Prescription by State",
                  align: "left",
                },
                subtitle: {
                  text: "Pie chart of Prescription by state",
                  align: "left",
                },
                chart: {
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false,
                  type: "pie",
                },
                credits: {
                  enabled: false,
                },
                accessibility: {
                  point: {
                    valueSuffix: "%",
                  },
                },
                plotOptions: {
                  pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    dataLabels: {
                      enabled: true,
                      format: "<b>{point.name}</b>: {point.percentage:.1f} %",
                    },
                  },
                },
                series: [
                  {
                    name: "States",
                    colorByPoint: true,
                    data: _.chain(prescAnalytics?.count_by_state)
                      .map((count) => {
                        return {
                          name: _.startCase(count.by),
                          y: count.value,
                        };
                      })
                      .value(),
                  },
                ],
              }}
            />
          </Stack>
          <Stack
            p={4}
            bgColor={"bg-surface"}
            borderRadius={"lg"}
            boxShadow="sm"
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                title: {
                  text: "Average wait time by state (hours)",
                  align: "left",
                },
                subtitle: {
                  text: "Bar chart of average wait time by state",
                  align: "left",
                },
                xAxis: {
                  categories: _.chain(prescAnalytics?.avg_time_in_state)
                    .map((count) => {
                      return _.startCase(count.by);
                    })
                    .value(),
                  crosshair: true,
                  accessibility: {
                    description: "States",
                  },
                },
                tooltip: {
                  valueSuffix: " hours",
                },
                chart: {
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false,
                  type: "column",
                },
                plotOptions: {
                  column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                  },
                },
                credits: {
                  enabled: false,
                },
                series: [
                  {
                    name: "States",
                    colorByPoint: true,
                    data: _.chain(prescAnalytics?.avg_time_in_state)
                      .map((count) => {
                        const h = moment
                          .duration(count.value, "seconds")
                          .asHours();
                        return {
                          name: _.startCase(count.by),
                          y: _.round(h, 2),
                        };
                      })
                      .value(),
                  },
                ],
              }}
            />
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
}
