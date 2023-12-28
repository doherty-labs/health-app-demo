import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../components/auth0-utils";

export const getPrescriptionStates = async (accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + "states/prescription";
  const response = await fetch(baseURL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const request = await response;
  const data = await request.json();
  return { request, data };
};

export default withApiAuthRequired(
  withApiRouteToken(async function products(req, res, token) {
    const { request, data } = await getPrescriptionStates(token);
    res.status(request.status).json(data);
  }),
);
