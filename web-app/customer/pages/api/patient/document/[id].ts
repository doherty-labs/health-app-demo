import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../../components/auth0-utils";

export const getDownloadUrl = async (accessToken: string, id: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `patient/document/${id}`;
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

export const deleteDoc = async (accessToken: string, id: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + `patient/document/${id}`;
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

export default withApiAuthRequired(
  withApiRouteToken(async function products(req, res, token) {
    const id: string = (req.query.id as string) || "";

    if (req.method === "GET") {
      const { request, data } = await getDownloadUrl(token, id);
      res.status(request.status).json(data);
    }

    if (req.method === "DELETE") {
      const { request } = await deleteDoc(token, id);
      res.status(request.status).json({});
    }
  }),
);
