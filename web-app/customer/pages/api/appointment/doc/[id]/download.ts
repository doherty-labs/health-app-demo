import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const getDownloadUrl = async (accessToken: string, id: string) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL + `appointment/doc/${id}/download`;
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

export default withApiAuthRequired(async function products(req, res) {
  const { accessToken } = await getAccessToken(req, res);
  const token: string = accessToken || "";
  const id: string = (req.query.id as string) || "";

  if (req.method === "GET") {
    const { request, data } = await getDownloadUrl(token, id);
    res.status(request.status).json(data);
  }
});
