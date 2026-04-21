import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  API_BASE_URL,
  API_ENDPOINT_SIGN_UP,
  REFRESH_TOKEN_COOKIE_KEY,
} from "@/lib/constants";
import {
  getNextResponse,
  getNextResponseBackendFetchFailed,
  getNextResponseUnparsableBackendResponse,
} from "@/lib/utils/apiRoutes";

export const POST = async (request: Request) => {
  const { email, password, birthdate } = await request.json();

  const backendRequestBody = JSON.stringify({ email, password, birthdate });

  let backendResponse;

  try {
    const url = `${API_BASE_URL}/${API_ENDPOINT_SIGN_UP}`;

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

  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    access_token_expiration_utc: accessTokenExpirationDate,
  } = backendResponseData;

  const accessTokenCookie = {
    name: ACCESS_TOKEN_COOKIE_KEY,
    value: accessToken,
    path: "/",
    secure: true,
    httpOnly: true,
  };

  const refreshTokenCookie = {
    name: REFRESH_TOKEN_COOKIE_KEY,
    value: refreshToken,
    path: "/",
    secure: true,
    httpOnly: true,
  };

  // See https://nextjs.org/docs/app/api-reference/functions/next-response#setname-value
  const response = new NextResponse(
    JSON.stringify({ access_token_expiration_utc: accessTokenExpirationDate }),
  );

  response.cookies.set(accessTokenCookie);
  response.cookies.set(refreshTokenCookie);

  return response;
};
