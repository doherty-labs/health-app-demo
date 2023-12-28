import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../components/auth0-utils";

export const getAppointments = async (
  urlParams: string,
  accessToken: string,
) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + "appointments?" + urlParams;
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
    const urlParams = new URLSearchParams(req.query as any).toString();
    const { request, data } = await getAppointments(urlParams, token);
    res.status(request.status).json(data);
  }),
);
