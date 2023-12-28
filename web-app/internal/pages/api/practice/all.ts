import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../components/auth0-utils";

export const getAllPractices = async (
  accessToken: string,
  urlParams: string,
) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + "practices?" + urlParams;
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
    const { request, data } = await getAllPractices(
      token,
      new URLSearchParams(req.query as any).toString(),
    );
    res.status(request.status).json(data);
  }),
);
