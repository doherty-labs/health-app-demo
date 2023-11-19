import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export const createPatient = async (body: any, accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `patient/manage`;
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

export const getPatient = async (accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `patient/manage`;
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

export const updatePatient = async (body: any, accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `patient/manage`;
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

export const deletePatient = async (accessToken: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `patient/manage`;
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
    const { request, data } = await updatePatient(
      JSON.stringify(req.body),
      token,
    );
    res.status(request.status).json(data);
  } else if (req.method === "DELETE") {
    const { request } = await deletePatient(token);
    res.status(request.status).json({});
  } else if (req.method === "GET") {
    const { request, data } = await getPatient(token);
    res.status(request.status).json(data);
  } else if (req.method === "POST") {
    const { request, data } = await createPatient(
      JSON.stringify(req.body),
      token,
    );
    res.status(request.status).json(data);
  }
});
