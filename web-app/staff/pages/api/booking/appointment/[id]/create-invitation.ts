import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const createBooking = async (
  body: any,
  accessToken: string,
  id: string,
) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL +
    `booking/invitation/create/appointment/${id}/`;
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
  const token: string = accessToken || "";
  const id: string = (req.query.id as string) || "";

  if (req.method === "POST") {
    const { request, data } = await createBooking(
      JSON.stringify(req.body),
      token,
      id,
    );
    res.status(request.status).json(data);
  }
});
