import { LoginOptions, handleAuth, handleLogin } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

export default handleAuth({
  async login(
    req: NextApiRequest,
    res: NextApiResponse,
    options?: LoginOptions,
  ) {
    const { invitation, organization, organization_name } = req.query;

    await handleLogin(req, res, {
      ...options,
      authorizationParams: {
        ...options?.authorizationParams,
        invitation: invitation ? (invitation as string) : undefined,
        organization: organization ? (organization as string) : undefined,
        organization_name,
        audience: process.env.AUTH0_AUDIENCE,
        scope: process.env.AUTH0_SCOPE,
      },
    });
  },
});
