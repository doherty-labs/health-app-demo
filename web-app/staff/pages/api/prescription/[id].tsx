import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const updatePrescription = async (
  id: string,
  body: any,
  accessToken: string,
) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `prescription/${id}`;
  const response = await fetch(baseURL, {
    method: "PUT",
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

export const getPrescription = async (id: string, accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `prescription/${id}`;
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
  const id: string = (req.query.id as string) || "";
  const token: string = accessToken || "";
  if (req.method === "GET") {
    const { request, data } = await getPrescription(id, token);
    res.status(request.status).json(data);
  }

  if (req.method === "PUT") {
    const { request, data } = await updatePrescription(
      id,
      JSON.stringify(req.body),
      token,
    );
    res.status(request.status).json(data);
  }
});
