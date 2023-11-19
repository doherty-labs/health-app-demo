import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const getPrescriptionById = async (id: string, accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + "prescription/" + id;
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
  const { request, data } = await getPrescriptionById(id, token);
  res.status(request.status).json(data);
});
