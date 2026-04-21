import { API_ENDPOINT_SAVE_PIN } from "@/lib/constants";
import { fetchBackendResponse } from "@/lib/utils/apiRoutes";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const { pin_id, board_id } = await request.json();

  const backendRequestBody = JSON.stringify({ pin_id, board_id });

  return fetchBackendResponse({
    endpoint: API_ENDPOINT_SAVE_PIN,
    method: "POST",
    backendRequestBody,
    withAuthentication: true,
  });
};
