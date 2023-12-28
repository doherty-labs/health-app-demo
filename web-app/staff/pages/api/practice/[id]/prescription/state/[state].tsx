import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../../../../components/auth0-utils";

export const getPrescriptions = async (
  urlParams: string,
  accessToken: string,
  id: string,
  state: string,
) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL +
    `practice/${id}/prescriptions/state/${state}?` +
    urlParams;
  const response = await fetch(baseURL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const request = await response;
  const data = await request.json();
  return { request, data };
};

export default withApiAuthRequired(
  withApiRouteToken(async function products(req, res, token) {
    const id = req.query.id as string;
    const state = req.query.state as string;
    const urlParams = new URLSearchParams(req.query as any).toString();
    const { request, data } = await getPrescriptions(
      urlParams,
      token,
      id,
      state,
    );
    res.status(request.status).json(data);
  }),
);
