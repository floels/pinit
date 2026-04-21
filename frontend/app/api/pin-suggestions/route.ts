import { NextRequest } from "next/server";
import { API_ENDPOINT_PIN_SUGGESTIONS } from "@/lib/constants";
import { fetchBackendResponse } from "@/lib/utils/apiRoutes";

export const GET = (request: NextRequest) => {
  const queryParams = request.nextUrl.searchParams;
  const page = queryParams.get("page");

  return fetchBackendResponse({
    endpoint: `${API_ENDPOINT_PIN_SUGGESTIONS}?page=${page}`,
    withAuthentication: true,
  });
};
