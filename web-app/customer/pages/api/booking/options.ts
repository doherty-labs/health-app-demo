import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../components/auth0-utils";

export const getBookingOptions = async (
  accessToken: string,
  urlParams: string,
) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL + `booking/options?` + urlParams;
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
    if (req.method === "GET") {
      const { request, data } = await getBookingOptions(
        token,
        new URLSearchParams(req.query as any).toString(),
      );
      res.status(request.status).json(data);
    }
  }),
);
