import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../../../../../components/auth0-utils";

export const getAnalytics = async (
  accessToken: string,
  start_date: string,
  end_date: string,
  interval: string,
) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL +
    `analytics/appointment/start-date/${start_date}/end-date/${end_date}/interval/${interval}`;
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
    const start_date: string = (req.query.start_date as string) || "";
    const end_date: string = (req.query.end_date as string) || "";
    const interval: string = (req.query.interval as string) || "";

    if (req.method === "GET") {
      const { request, data } = await getAnalytics(
        token,
        start_date,
        end_date,
        interval,
      );
      res.status(request.status).json(data);
    }
  }),
);
