import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export default withApiAuthRequired(async function products(req, res) {
  const { accessToken } = await getAccessToken(req, res);
  const id: string = (req.query.id as string) || "";
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL + `practices/${id}/invite-user`;
  const response = await fetch(baseURL, {
    method: "POST",
    body: JSON.stringify(req.body),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const request = await response;
  res.status(request.status).json({});
});