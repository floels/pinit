import { API_ENDPOINT_MY_ACCOUNT_DETAILS } from "@/lib/constants";
import { fetchBackendResponse } from "@/lib/utils/apiRoutes";

export const GET = () => {
  return fetchBackendResponse({
    endpoint: API_ENDPOINT_MY_ACCOUNT_DETAILS,
    withAuthentication: true,
  });
};
