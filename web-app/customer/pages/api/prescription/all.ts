import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const getPrescriptions = async (
  urlParams: string,
  accessToken: string,
) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL + "prescriptions?" + urlParams;
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
  const urlParams = new URLSearchParams(req.query as any).toString();
  const { request, data } = await getPrescriptions(urlParams, token);
  res.status(request.status).json(data);
});
