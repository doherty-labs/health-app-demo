import { Button, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";

interface LogoProps {
  name: string;
}

export function Logo({ name }: LogoProps) {
  const { push } = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => {
        push("/");
      }}
    >
      <Heading size={"xs"} color="accent">
        {name}
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
