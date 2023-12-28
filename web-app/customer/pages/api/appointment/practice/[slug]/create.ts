import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../../../components/auth0-utils";

export const createBooking = async (
  slug: string,
  body: any,
  accessToken: string,
) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL + `appointment/create/practice/` + slug;
  const response = await fetch(baseURL, {
    method: "POST",
    body,
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
    const slug: string = (req.query.slug as string) || "";
    if (req.method === "POST") {
      const { request, data } = await createBooking(
        slug,
        JSON.stringify(req.body),
        token,
      );
      res.status(request.status).json(data);
    }
  }),
);
