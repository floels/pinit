import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  API_BASE_URL,
  ERROR_CODE_BACKEND_FETCH_FAILED,
  ERROR_CODE_MISSING_ACCESS_TOKEN,
  ERROR_CODE_UNPARSABLE_BACKEND_RESPONSE,
  REFRESH_TOKEN_COOKIE_KEY,
} from "../constants";
import { MissingAccessTokenError } from "../customErrors";

export const fetchBackendResponse = async ({
  endpoint,
  method,
  backendRequestBody,
  backendRequestHeaders,
  withAuthentication,
}: {
  endpoint: string;
  method?: string;
  backendRequestBody?: BodyInit;
  backendRequestHeaders?: HeadersInit;
  withAuthentication?: boolean;
}) => {
  let backendRequestHeadersWithAuthorization;

  try {
    backendRequestHeadersWithAuthorization =
      getbackendRequestHeadersWithAuthorization({
        backendRequestHeaders,
        withAuthentication,
      });
  } catch {
    return getNextResponseMissingAccessToken();
  }

  let backendResponse;

  try {
    backendResponse = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method,
      body: backendRequestBody,
      headers: backendRequestHeadersWithAuthorization,
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

  return getNextResponse({
    backendResponseData,
    status: backendResponse.status,
  });
};

const getbackendRequestHeadersWithAuthorization = ({
  backendRequestHeaders,
  withAuthentication,
}: {
  backendRequestHeaders: HeadersInit | undefined;
  withAuthentication: boolean | undefined;
}) => {
  if (withAuthentication) {
    const accessToken = getAccessTokenFromCookie();

    if (!accessToken) {
      throw new MissingAccessTokenError();
    }

    return { ...backendRequestHeaders, Authorization: `Bearer ${accessToken}` };
  }

  return backendRequestHeaders;
};

export const getAccessTokenFromCookie = () => {
  // See https://nextjs.org/docs/app/building-your-application/routing/route-handlers#cookies
  const cookieStore = cookies();

  return cookieStore.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
};

const getNextResponseMissingAccessToken = () =>
  new NextResponse(
    JSON.stringify({ errors: [ERROR_CODE_MISSING_ACCESS_TOKEN] }),
    { status: 401 },
  );

export const getNextResponseBackendFetchFailed = () =>
  new NextResponse(
    JSON.stringify({ errors: [ERROR_CODE_BACKEND_FETCH_FAILED] }),
    { status: 500 },
  );

export const getNextResponseUnparsableBackendResponse = () =>
  new NextResponse(
    JSON.stringify({ errors: [ERROR_CODE_UNPARSABLE_BACKEND_RESPONSE] }),
    { status: 500 },
  );

export const getNextResponse = ({
  backendResponseData,
  status,
}: {
  backendResponseData: { [key: string]: unknown };
  status: number;
}) =>
  new NextResponse(JSON.stringify(backendResponseData), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getNextResponseObtainTokenSuccess = ({
  backendResponseData,
}: {
  backendResponseData: { [key: string]: string };
}) => {
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
