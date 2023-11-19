import { NextApiRequest, NextApiResponse } from "next";

export const searchAllPractices = async (urlParams: string) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL + "practices/autocomplete?" + urlParams;
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
  const { request, data } = await searchAllPractices(
    new URLSearchParams(req.query as any).toString()
  );
  res.status(request.status).json(data);
}
