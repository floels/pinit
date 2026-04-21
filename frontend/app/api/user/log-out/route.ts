import {
  ACCESS_TOKEN_COOKIE_KEY,
  REFRESH_TOKEN_COOKIE_KEY,
} from "@/lib/constants";
import { NextResponse } from "next/server";

export const POST = () => {
  const clearedAccessTokenCookie = {
    name: ACCESS_TOKEN_COOKIE_KEY,
    value: "",
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 0,
  };

  const clearedRefreshTokenCookie = {
    name: REFRESH_TOKEN_COOKIE_KEY,
    value: "",
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 0,
  };

  // See https://nextjs.org/docs/app/api-reference/functions/next-response#setname-value
  const response = new NextResponse();

  response.cookies.set(clearedAccessTokenCookie);
  response.cookies.set(clearedRefreshTokenCookie);

  return response;
};
