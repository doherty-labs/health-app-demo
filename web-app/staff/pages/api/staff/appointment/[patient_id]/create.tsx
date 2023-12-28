import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { withApiRouteToken } from "../../../../../components/auth0-utils";

export const createAppointment = async (
  patient_id: string,
  body: any,
  accessToken: string,
) => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL +
    `staff/patient/${patient_id}/appointment/create`;
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

export default withApiAuthRequired(
  withApiRouteToken(async function products(req, res, token) {
    const patient_id: string = (req.query.patient_id as string) || "";
    if (req.method === "POST") {
      const { request, data } = await createAppointment(
        patient_id,
        JSON.stringify(req.body),
        token,
      );
      res.status(request.status).json(data);
    }
  }),
);
