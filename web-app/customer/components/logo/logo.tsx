import { Button, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";

export function Logo() {
  const { push } = useRouter();
  return (
    <Button
      variant="outline"
      onClick={() => {
        push("/");
      }}
    >
      <Heading size={"xs"} color="accent">
        GP Base
      </Heading>
    </Button>
  );
}

export function LogoNegative() {
  const { push } = useRouter();
  return (
    <Button
      variant={"outline"}
      onClick={() => {
        push("/");
      }}
    >
      <Heading size={"xs"} color="accent">
        GP Base
      </Heading>
    </Button>
  );
}
