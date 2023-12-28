import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../../../components/auth0-utils";

export const getAllAvailability = async (
  accessToken: string,
  urlParams: string,
  practiceId: string,
  teamMemberId: string,
) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL +
    `availability/practice/${practiceId}/member/${teamMemberId}?` +
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
    const practiceId: string = (req.query.practice_id as string) || "";
    const teamMemberId: string = (req.query.team_member_id as string) || "";
    const { request, data } = await getAllAvailability(
      token,
      new URLSearchParams(req.query as any).toString(),
      practiceId,
      teamMemberId,
    );
    res.status(request.status).json(data);
  }),
);
