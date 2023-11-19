import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const createPatient = async (body: any, accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `staff/patient/create`;
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

export default withApiAuthRequired(async function products(req, res) {
  const { accessToken } = await getAccessToken(req, res);
  const id: string = (req.query.id as string) || "";
  const token: string = accessToken || "";
  const { request, data } = await createPatient(
    JSON.stringify(req.body),
    token,
  );
  res.status(request.status).json(data);
});
