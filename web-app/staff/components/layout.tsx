import { ReactElement, useMemo, useRef, useState } from "react";
import {
  Button,
  Center,
  Container,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { useSize } from "@chakra-ui/react-use-size";
import useWindowDimensions from "./dimensions";
import { useRouteChangeLoading } from "../state/loading";
import { NavbarComponent } from "./navbar/navbar";
import { Footer } from "./navbar/footer";
import { useUserOnboarded } from "./hooks/user-onboarded";
import { useRouter } from "next/router";

export interface LayoutProps {
  children: ReactElement;
  excludeContainer?: boolean;
}

export default function Layout({ children, excludeContainer }: LayoutProps) {
  const { height } = useWindowDimensions();
  const navRef = useRef<HTMLDivElement>(null);
  const dim = useSize<HTMLDivElement>(navRef);
  const [navHeight, setNavHeight] = useState(0);
  const { loading } = useRouteChangeLoading();
  const { onboarded } = useUserOnboarded();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { push, route } = useRouter();

  useMemo(() => {
    if (dim !== undefined) {
      setNavHeight(dim.height);
    }
  }, [dim]);

  useMemo(() => {
    if (onboarded === false && route !== "/user") {
      onOpen();
    }
  }, [onboarded, onOpen, route]);

  return (
    <Flex direction={"column"}>
      <NavbarComponent ref={navRef} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Registration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Please complete the registration process before using GPBase.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                onClose();
                push(`/user`);
              }}
            >
              Complete Registration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Flex minH={height !== undefined ? height - navHeight : "100vh"}>
        {loading ? (
          <Container>
            <Center p={"2rem"}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            </Center>
          </Container>
        ) : excludeContainer ? (
          children
        ) : (
          <Container>{children}</Container>
        )}
      </Flex>
      <Footer />
    </Flex>
  );
}
