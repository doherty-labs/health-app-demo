import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const getAppointments = async (
  urlParams: string,
  accessToken: string,
  id: string,
  state: string,
) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL +
    `practice/${id}/appointments/state/${state}?` +
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

export default withApiAuthRequired(async function products(req, res) {
  const { accessToken } = await getAccessToken(req, res);
  const token: string = accessToken || "";
  const id = req.query.id as string;
  const state = req.query.state as string;
  const urlParams = new URLSearchParams(req.query as any).toString();
  const { request, data } = await getAppointments(urlParams, token, id, state);
  res.status(request.status).json(data);
});
