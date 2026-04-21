import { NextRequest } from "next/server";
import { API_ENDPOINT_SEARCH_PINS } from "@/lib/constants";
import { fetchBackendResponse } from "@/lib/utils/apiRoutes";

export const GET = (request: NextRequest) => {
  const queryParams = request.nextUrl.searchParams;
  const page = queryParams.get("page");
  const q = queryParams.get("q");

  return fetchBackendResponse({
    endpoint: `${API_ENDPOINT_SEARCH_PINS}/?q=${q}&page=${page}`,
  });
};
