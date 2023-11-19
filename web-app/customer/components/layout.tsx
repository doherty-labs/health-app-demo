import { ReactElement, useMemo, useRef, useState } from "react";
import { NavbarComponent } from "./navbar/navbar";
import { Center, Container, Flex, Spinner } from "@chakra-ui/react";
import { useSize } from "@chakra-ui/react-use-size";
import { Footer } from "./navbar/footer";
import useWindowDimensions from "./dimensions";
import { useRouteChangeLoading } from "./state/loading";

export interface LayoutProps {
  children: ReactElement;
}

export default function Layout({ children }: LayoutProps) {
  const { height } = useWindowDimensions();
  const navRef = useRef<HTMLDivElement>(null);
  const dim = useSize<HTMLDivElement>(navRef);
  const [navHeight, setNavHeight] = useState(0);
  const { loading } = useRouteChangeLoading();

  useMemo(() => {
    if (dim !== undefined) {
      setNavHeight(dim.height);
    }
  }, [dim]);

  return (
    <Flex direction={"column"}>
      <NavbarComponent ref={navRef} />
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
        ) : (
          <Container>{children}</Container>
        )}
      </Flex>
      <Footer />
    </Flex>
  );
}
