import { API_BASE_URL, API_ENDPOINT_OBTAIN_TOKEN } from "@/lib/constants";
import {
  getNextResponse,
  getNextResponseBackendFetchFailed,
  getNextResponseObtainTokenSuccess,
  getNextResponseUnparsableBackendResponse,
} from "@/lib/utils/apiRoutes";

export const POST = async (request: Request) => {
  const { email, password } = await request.json();

  const backendRequestBody = JSON.stringify({ email, password });

  let backendResponse;

  try {
    const url = `${API_BASE_URL}/${API_ENDPOINT_OBTAIN_TOKEN}`;

    backendResponse = await fetch(url, {
      method: "POST",
      body: backendRequestBody,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return getNextResponseBackendFetchFailed();
  }

  let backendResponseData;

  try {
    backendResponseData = await backendResponse.json();
  } catch {
    return getNextResponseUnparsableBackendResponse();
  }

  if (!backendResponse.ok) {
    return getNextResponse({
      backendResponseData,
      status: backendResponse.status,
    });
  }

  return getNextResponseObtainTokenSuccess({ backendResponseData });
};
