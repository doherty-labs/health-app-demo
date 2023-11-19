import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const getAvailability = async (id: string, accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `availability/${id}/manage`;
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

export const updateAvailability = async (
  id: string,
  body: any,
  accessToken: string,
) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `availability/${id}/manage`;
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

export const deleteAvailability = async (id: string, accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `availability/${id}/manage`;
  const response = await fetch(baseURL, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const request = await response;
  return { request };
};

export default withApiAuthRequired(async function products(req, res) {
  const { accessToken } = await getAccessToken(req, res);
  const id: string = (req.query.id as string) || "";
  const token: string = accessToken || "";
  if (req.method === "PUT") {
    const { request, data } = await updateAvailability(
      id,
      JSON.stringify(req.body),
      token,
    );
    res.status(request.status).json(data);
  } else if (req.method === "DELETE") {
    const { request } = await deleteAvailability(id, token);
    res.status(request.status).json({});
  } else if (req.method === "GET") {
    const { request, data } = await getAvailability(id, token);
    res.status(request.status).json(data);
  }
});
