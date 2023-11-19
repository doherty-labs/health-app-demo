import { NextApiRequest, NextApiResponse } from "next";

export const getPracticeBySlug = async (slug: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL + "practices/find/" + slug;
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
  const slug: string = (req.query.slug as string) || "";
  const { request, data } = await getPracticeBySlug(slug);
  res.status(request.status).json(data);
}
