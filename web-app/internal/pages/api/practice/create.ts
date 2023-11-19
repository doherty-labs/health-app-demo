import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export default withApiAuthRequired(async function products(req, res) {
  const { accessToken } = await getAccessToken(req, res);
  const baseURL = process.env.NEXT_PUBLIC_API_URL + "practice/create";
  const response = await fetch(baseURL, {
    method: "POST",
    body: JSON.stringify(req.body),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const request = await response;
  const data = await request.json();
  res.status(request.status).json(data);
});
