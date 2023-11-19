import { NextApiRequest, NextApiResponse } from "next";

export const getPracticeByOrgId = async (orgId: string) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL + "practices/get/org-id/" + orgId;
  const response = await fetch(baseURL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const request = await response;
  const data = await request.json();
  return { request, data };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const org_id: string = (req.query.org_id as string) || "";
  const { request, data } = await getPracticeByOrgId(org_id);
  res.status(request.status).json(data);
}
