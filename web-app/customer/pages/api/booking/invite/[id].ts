import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../../components/auth0-utils";

export const getBookingInvite = async (id: string, accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `booking/invitation/${id}/`;
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
    const id: string = (req.query.id as string) || "";
    if (req.method === "GET") {
      const { request, data } = await getBookingInvite(id, token);
      res.status(request.status).json(data);
    }
  }),
);
