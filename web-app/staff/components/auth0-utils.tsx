import { getAccessToken } from "@auth0/nextjs-auth0";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
  PreviewData,
} from "next/types";
import { ParsedUrlQuery } from "querystring";

type CustomGetServerSideProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
> = (
  context: GetServerSidePropsContext<Q, D>,
  token: string,
) => Promise<GetServerSidePropsResult<P>>;

export function withPageToken(getServerSideProps: CustomGetServerSideProps) {
  return async (ctx: GetServerSidePropsContext) => {
    let token: string = "";
    const redirect = `/api/auth/login?returnTo=${encodeURIComponent(
      ctx.resolvedUrl,
    )}`;
    try {
      const { accessToken } = await getAccessToken(ctx.req, ctx.res);
      if (!accessToken) {
        return {
          redirect: {
            destination: redirect,
            permanent: false,
          },
        };
      }
      token = accessToken;
    } catch (e) {
      return {
        redirect: {
          destination: redirect,
          permanent: false,
        },
      };
    }
    return await getServerSideProps(ctx, token);
  };
}

declare type CustomNextApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  token: string,
) => unknown | Promise<unknown>;

export function withApiRouteToken(apiHandler: CustomNextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let token: string = "";
    try {
      const { accessToken } = await getAccessToken(req, res);
      if (!accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      token = accessToken;
    } catch (e) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return await apiHandler(req, res, token);
  };
}
