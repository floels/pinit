import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  API_BASE_URL,
  API_ENDPOINT_REFRESH_TOKEN,
} from "@/lib/constants";
import {
  getNextResponse,
  getNextResponseBackendFetchFailed,
  getNextResponseUnparsableBackendResponse,
} from "@/lib/utils/apiRoutes";

const ERROR_CODE_MISSING_REFRESH_TOKEN = "missing_refresh_token";

const getNextResponseMissingRefreshToken = () =>
  new NextResponse(
    JSON.stringify({ errors: [ERROR_CODE_MISSING_REFRESH_TOKEN] }),
    { status: 400 },
  );

export const POST = async () => {
  const refreshToken = cookies().get("refreshToken")?.value;

  if (!refreshToken) {
    return getNextResponseMissingRefreshToken();
  }

  const backendRequestBody = JSON.stringify({ refresh_token: refreshToken });

  let backendResponse;

  try {
    backendResponse = await fetch(
      `${API_BASE_URL}/${API_ENDPOINT_REFRESH_TOKEN}`,
      {
        method: "POST",
        body: backendRequestBody,
        headers: { "Content-Type": "application/json" },
      },
    );
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

  const {
    access_token: accessToken,
    access_token_expiration_utc: accessTokenExpirationDate,
  } = backendResponseData;

  const accessTokenCookie = {
    name: ACCESS_TOKEN_COOKIE_KEY,
    value: accessToken,
    path: "/",
    secure: true,
    httpOnly: true,
  };

  // See https://nextjs.org/docs/app/api-reference/functions/next-response#setname-value
  const response = new NextResponse(
    JSON.stringify({ access_token_expiration_utc: accessTokenExpirationDate }),
  );

  response.cookies.set(accessTokenCookie);

  return response;
};
