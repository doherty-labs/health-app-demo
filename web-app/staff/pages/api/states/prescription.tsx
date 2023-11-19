import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const getPrescriptionStates = async (accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + "states/prescription";
  const response = await fetch(baseURL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const request = await response;
  const data = await request.json();
  return { request, data };
};

export default withApiAuthRequired(async function products(req, res) {
  const { accessToken } = await getAccessToken(req, res);
  const token: string = accessToken || "";
  const { request, data } = await getPrescriptionStates(token);
  res.status(request.status).json(data);
});
