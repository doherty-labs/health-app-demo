import { Button, Heading } from "@chakra-ui/react";

export function Logo() {
  return (
    <Button variant="outline">
      <Heading size={"xs"} color="accent">
        GP Base
      </Heading>
    </Button>
  );
}

export function LogoNegative() {
  return (
    <Button variant={"outline"}>
      <Heading size={"xs"} color="accent">
        GP Base
      </Heading>
    </Button>
  );
}
