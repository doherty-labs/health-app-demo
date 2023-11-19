import { ReactElement, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { datadogRum } from "@datadog/browser-rum";

export interface Auth0DataDogIntegrationProps {
  children: ReactElement;
}

export function Auth0DataDogIntegration({
  children,
}: Auth0DataDogIntegrationProps) {
  const { user } = useUser();
  useEffect(() => {
    if (user && user.name && user.email) {
      datadogRum.setUser({
        id: user.email,
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);
  return <>{children}</>;
}
