import { NextRequest } from "next/server";
import { API_ENDPOINT_SEARCH_SUGGESTIONS } from "@/lib/constants";
import { fetchBackendResponse } from "@/lib/utils/apiRoutes";

export const GET = (request: NextRequest) => {
  const queryParams = request.nextUrl.searchParams;
  const search = queryParams.get("search");

  return fetchBackendResponse({
    endpoint: `${API_ENDPOINT_SEARCH_SUGGESTIONS}?search=${search}`,
  });
};
