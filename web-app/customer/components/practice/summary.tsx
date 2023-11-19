import {
  Container,
  Flex,
  Stack,
  Text,
  useBreakpointValue,
  Box,
  IconButton,
  Divider,
  HStack,
  Button,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { Wrapper } from "@googlemaps/react-wrapper";

export interface BusinessTimeRange {
  hoursType: "opensAt" | "closedAt";
  startTime: string;
  endTime: string;
}

export interface OpeningDayRowProps {
  nameOfDay: string;
  dayNumber: number;
  businessHours: BusinessTimeRange[];
}

export interface ContactDetailsRowProps {
  id: number;
  name: string;
  displayValue: string;
  href: string;
}

export interface ContactDetailsCardProps {
  contactPoints: ContactDetailsRowProps[];
}

export interface OpeningDayCardProps {
  days: OpeningDayRowProps[];
}

export interface LocationDetailsCardProps {
  address: string;
  lat: number;
  lng: number;
}

export interface SummaryTabProps {
  locationDetails: LocationDetailsCardProps;
  contactDetails: ContactDetailsCardProps;
  openingHours: OpeningDayCardProps;
}

export function OpeningDayRow({
  nameOfDay,
  businessHours,
}: OpeningDayRowProps) {
  return (
    <Flex direction={"column"}>
      {businessHours.length > 0 ? (
        <Flex
          justifyContent={"space-between"}
          direction={{ base: "column", sm: "column", md: "row" }}
          gap={{
            base: "6",
            md: "12",
          }}
        >
          <Text fontSize="md">{nameOfDay}:</Text>
          <Flex direction={"column"} gap={3}>
            {businessHours.map((item) => {
              return (
                <HStack
                  direction={"row"}
                  gap={5}
                  key={item.hoursType}
                  w={"100%"}
                  justify={"space-between"}
                >
                  <HStack>
                    {item.hoursType === "closedAt" ? (
                      <Text fontSize="sm" color={"muted"}>
                        Closed
                      </Text>
                    ) : (
                      <Text fontSize="sm" color={"muted"}>
                        Open
                      </Text>
                    )}
                  </HStack>

                  <HStack
                    hidden={item.startTime.length === 0}
                    justify={"space-between"}
                  >
                    <Text fontSize="md">{item.startTime}</Text>
                    <Text fontSize="md">-</Text>
                    <Text fontSize="md">{item.endTime}</Text>
                  </HStack>
                </HStack>
              );
            })}
          </Flex>
        </Flex>
      ) : null}
      {businessHours.length === 0 ? (
        <Flex justifyContent={"space-between"} direction={"row"} gap={3}>
          <Text fontSize="md">{nameOfDay}:</Text>
          <Text fontSize="md" as={"b"}>
            Closed
          </Text>
        </Flex>
      ) : null}
    </Flex>
  );
}

export function OpeningHoursCard({ days }: OpeningDayCardProps) {
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const [compressedMode, setCompressedMode] = useState(false);

  useMemo(() => {
    setCompressedMode(isDesktop ? false : true);
  }, [isDesktop]);
  return (
    <Box>
      <Box
        borderRadius="lg"
        borderColor={"gray-200"}
        borderWidth={"0.1rem"}
        p={{ base: "6", sm: "8", md: "6" }}
      >
        <Stack spacing="5">
          <Stack gap="1" direction={"row"} justifyContent={"space-between"}>
            <Stack spacing="1">
              <Text fontSize="lg" fontWeight="medium">
                Opening Hours
              </Text>
              <Text fontSize="sm" color="muted">
                Find when we are available.
              </Text>
            </Stack>
          </Stack>
          <Stack direction={"column"} spacing="3" divider={<Divider />}>
            {!compressedMode
              ? days.map((item) => {
                  return <OpeningDayRow key={item.dayNumber} {...item} />;
                })
              : days
                  .filter((item) => item.dayNumber === new Date().getDay())
                  .map((item) => {
                    return <OpeningDayRow key={item.dayNumber} {...item} />;
                  })}
          </Stack>
          <Divider hidden={isDesktop} />
          <HStack hidden={isDesktop}>
            <Button
              variant={"outline"}
              onClick={() => setCompressedMode(!compressedMode)}
            >
              {compressedMode ? (
                <Stack direction={"row"}>
                  <Text>More Times</Text> <FiArrowDown fontSize="1rem" />
                </Stack>
              ) : (
                <Stack direction={"row"}>
                  <Text> Less Times</Text> <FiArrowUp fontSize="1rem" />
                </Stack>
              )}
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
}

export function ContactDetailsCard({ contactPoints }: ContactDetailsCardProps) {
  return (
    <Box>
      <Box
        borderColor={"gray-200"}
        borderWidth={"0.1rem"}
        borderRadius="lg"
        p={{ base: "6", sm: "8", md: "6" }}
      >
        <Stack spacing="5">
          <Stack spacing="1">
            <Text fontSize="lg" fontWeight="medium">
              Contact Details
            </Text>
            <Text fontSize="sm" color="muted">
              Get in touch via phone or email.
            </Text>
          </Stack>
          <Flex w={"100%"} justify={"center"}>
            <Stack direction={"column"} divider={<Divider />} w={"100%"}>
              {contactPoints.map((item) => {
                return (
                  <Flex
                    key={item.id}
                    justifyContent={"space-between"}
                    w={"100%"}
                    direction={{ base: "column", sm: "column", md: "row" }}
                    minW={"xs"}
                  >
                    <Text fontSize="md">{item.name} </Text>
                    <Text fontSize="md" color={"accent"} noOfLines={1}>
                      <a href={`${item.href}:${item.displayValue}`}>
                        {item.displayValue}
                      </a>
                    </Text>
                  </Flex>
                );
              })}
            </Stack>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

const Marker: React.FC<google.maps.MarkerOptions> = (options) => {
  const [marker, setMarker] = useState<google.maps.Marker>();

  useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useEffect(() => {
    if (marker) {
      marker.setOptions(options);
    }
  }, [marker, options]);

  return null;
};

function PracticeGoogleMap({
  center,
  zoom,
}: {
  center: google.maps.LatLngLiteral;
  zoom: number;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {}));
    }
  }, [ref, map]);

  useEffect(() => {
    if (ref.current !== null) {
      const tempMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
      });
      setMap(tempMap);
    }
  }, [ref, center, zoom]);

  return (
    <>
      <Box w={"100%"} h={"14rem"} ref={ref} id="map" />
      <Marker position={center} map={map} />
    </>
  );
}

export function LocationDetailsCard({
  address,
  lat,
  lng,
}: LocationDetailsCardProps) {
  const center = { lat: lat, lng: lng };
  const zoom = 17;

  return (
    <Container
      borderRadius="lg"
      borderColor={"gray.200"}
      borderWidth={"0.1rem"}
      p={{ base: "6", sm: "8", md: "6" }}
    >
      <Stack spacing="5">
        <Stack spacing="1">
          <Text fontSize="lg" fontWeight="medium">
            Location Details
          </Text>
          <Text fontSize="sm" color="muted">
            Visit our practice in person.
          </Text>
        </Stack>
        <Stack direction={{ base: "column", md: "column" }} spacing="3">
          <Text maxW="sm" noOfLines={4}>
            {address}
          </Text>
          <Wrapper apiKey={process.env.NEXT_PUBLIC_GMAPS_API_KEY || ""}>
            <PracticeGoogleMap center={center} zoom={zoom} />
          </Wrapper>
        </Stack>
      </Stack>
    </Container>
  );
}

export function SummaryTab({
  openingHours,
  contactDetails,
  locationDetails,
}: SummaryTabProps) {
  return (
    <Container
      p={{
        base: "0",
        sm: "0",
        md: "6",
      }}
    >
      <Stack
        w={"100%"}
        spacing={"4"}
        direction={{ base: "column", sm: "column", md: "row" }}
        justify={"center"}
      >
        <Stack>
          <OpeningHoursCard {...openingHours} />
        </Stack>

        <Stack>
          <ContactDetailsCard {...contactDetails} />
          <LocationDetailsCard {...locationDetails} />
        </Stack>
      </Stack>
    </Container>
  );
}
