import { API_ENDPOINT_CREATE_PIN } from "@/lib/constants";
import { fetchBackendResponse } from "@/lib/utils/apiRoutes";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();

  return fetchBackendResponse({
    endpoint: API_ENDPOINT_CREATE_PIN,
    method: "POST",
    backendRequestBody: formData,
    withAuthentication: true,
  });
};
