import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  API_BASE_URL,
  API_ENDPOINT_CREATE_PIN,
  API_ENDPOINT_MY_ACCOUNT_DETAILS,
  API_ENDPOINT_OBTAIN_DEMO_TOKEN,
  API_ENDPOINT_OBTAIN_TOKEN,
  API_ENDPOINT_PIN_SUGGESTIONS,
  API_ENDPOINT_REFRESH_TOKEN,
  API_ENDPOINT_SAVE_PIN,
  API_ENDPOINT_SEARCH_PINS,
  API_ENDPOINT_SEARCH_SUGGESTIONS,
  API_ENDPOINT_SIGN_UP,
  REFRESH_TOKEN_COOKIE_KEY,
} from "../lib/constants";

const PORT = 3001;

const app = express();
app.use(express.json());
app.use(cookieParser());

type BackendTokenResponse = {
  access_token: string;
  refresh_token: string;
  access_token_expiration_utc: string;
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  sameSite: "lax" as const,
};

// Buffer a readable stream (used for proxying multipart bodies)
const collectBody = async (req: Request): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req as unknown as AsyncIterable<Buffer>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const backendFetch = async ({
  endpoint,
  method = "GET",
  body,
  headers = {},
  accessToken,
}: {
  endpoint: string;
  method?: string;
  body?: string | Buffer;
  headers?: Record<string, string>;
  accessToken?: string;
}) => {
  const requestHeaders: Record<string, string> = { ...headers };
  if (accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  }
  return fetch(`${API_BASE_URL}/${endpoint}`, {
    method,
    body,
    headers: requestHeaders,
  });
};

const sendProxyResponse = async (
  backendResponse: globalThis.Response,
  res: Response
) => {
  let data;
  try {
    data = await backendResponse.json();
  } catch {
    return res.status(500).json({ errors: ["unparsable_backend_response"] });
  }
  return res.status(backendResponse.status).json(data);
};

const setAuthCookies = (
  res: Response,
  data: { access_token: string; refresh_token: string }
) => {
  res.cookie(ACCESS_TOKEN_COOKIE_KEY, data.access_token, COOKIE_OPTIONS);
  res.cookie(REFRESH_TOKEN_COOKIE_KEY, data.refresh_token, COOKIE_OPTIONS);
};

// POST /api/user/sign-up
app.post("/api/user/sign-up", async (req: Request, res: Response) => {
  const { email, password, birthdate } = req.body;

  let backendResponse;
  try {
    backendResponse = await backendFetch({
      endpoint: API_ENDPOINT_SIGN_UP,
      method: "POST",
      body: JSON.stringify({ email, password, birthdate }),
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return res.status(500).json({ errors: ["backend_fetch_failed"] });
  }

  let data: BackendTokenResponse;
  try {
    data = (await backendResponse.json()) as BackendTokenResponse;
  } catch {
    return res.status(500).json({ errors: ["unparsable_backend_response"] });
  }

  if (!backendResponse.ok) {
    return res.status(backendResponse.status).json(data);
  }

  setAuthCookies(res, data);
  return res.json({
    access_token_expiration_utc: data.access_token_expiration_utc,
  });
});

// POST /api/user/obtain-token
app.post("/api/user/obtain-token", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  let backendResponse;
  try {
    backendResponse = await backendFetch({
      endpoint: API_ENDPOINT_OBTAIN_TOKEN,
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return res.status(500).json({ errors: ["backend_fetch_failed"] });
  }

  let data: BackendTokenResponse;
  try {
    data = (await backendResponse.json()) as BackendTokenResponse;
  } catch {
    return res.status(500).json({ errors: ["unparsable_backend_response"] });
  }

  if (!backendResponse.ok) {
    return res.status(backendResponse.status).json(data);
  }

  setAuthCookies(res, data);
  return res.json({
    access_token_expiration_utc: data.access_token_expiration_utc,
  });
});

// GET /api/user/obtain-demo-token
app.get(
  "/api/user/obtain-demo-token",
  async (_req: Request, res: Response) => {
    let backendResponse;
    try {
      backendResponse = await backendFetch({
        endpoint: API_ENDPOINT_OBTAIN_DEMO_TOKEN,
      });
    } catch {
      return res.status(500).json({ errors: ["backend_fetch_failed"] });
    }

    let data: BackendTokenResponse;
    try {
      data = (await backendResponse.json()) as BackendTokenResponse;
    } catch {
      return res.status(500).json({ errors: ["unparsable_backend_response"] });
    }

    if (!backendResponse.ok) {
      return res.status(backendResponse.status).json(data);
    }

    setAuthCookies(res, data);
    return res.json({
      access_token_expiration_utc: data.access_token_expiration_utc,
    });
  }
);

// POST /api/user/refresh-token
app.post("/api/user/refresh-token", async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY];

  if (!refreshToken) {
    return res.status(400).json({ errors: ["missing_refresh_token"] });
  }

  let backendResponse;
  try {
    backendResponse = await backendFetch({
      endpoint: API_ENDPOINT_REFRESH_TOKEN,
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return res.status(500).json({ errors: ["backend_fetch_failed"] });
  }

  let data: Pick<BackendTokenResponse, "access_token" | "access_token_expiration_utc">;
  try {
    data = (await backendResponse.json()) as Pick<BackendTokenResponse, "access_token" | "access_token_expiration_utc">;
  } catch {
    return res.status(500).json({ errors: ["unparsable_backend_response"] });
  }

  if (!backendResponse.ok) {
    return res.status(backendResponse.status).json(data);
  }

  res.cookie(ACCESS_TOKEN_COOKIE_KEY, data.access_token, COOKIE_OPTIONS);
  return res.json({
    access_token_expiration_utc: data.access_token_expiration_utc,
  });
});

// GET /api/user/account-details
app.get("/api/user/account-details", async (req: Request, res: Response) => {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE_KEY];
  if (!accessToken) {
    return res.status(401).json({ errors: ["missing_access_token"] });
  }

  let backendResponse;
  try {
    backendResponse = await backendFetch({
      endpoint: API_ENDPOINT_MY_ACCOUNT_DETAILS,
      accessToken,
    });
  } catch {
    return res.status(500).json({ errors: ["backend_fetch_failed"] });
  }

  return sendProxyResponse(backendResponse, res);
});

// POST /api/user/log-out
app.post("/api/user/log-out", (_req: Request, res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE_KEY, { path: "/" });
  res.clearCookie(REFRESH_TOKEN_COOKIE_KEY, { path: "/" });
  return res.status(200).end();
});

// GET /api/pin-suggestions
app.get("/api/pin-suggestions", async (req: Request, res: Response) => {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE_KEY];
  if (!accessToken) {
    return res.status(401).json({ errors: ["missing_access_token"] });
  }

  const { page } = req.query;

  let backendResponse;
  try {
    backendResponse = await backendFetch({
      endpoint: `${API_ENDPOINT_PIN_SUGGESTIONS}?page=${page}`,
      accessToken,
    });
  } catch {
    return res.status(500).json({ errors: ["backend_fetch_failed"] });
  }

  return sendProxyResponse(backendResponse, res);
});

// GET /api/search
app.get("/api/search", async (req: Request, res: Response) => {
  const { q, page } = req.query;

  let backendResponse;
  try {
    backendResponse = await backendFetch({
      endpoint: `${API_ENDPOINT_SEARCH_PINS}/?q=${q}&page=${page}`,
    });
  } catch {
    return res.status(500).json({ errors: ["backend_fetch_failed"] });
  }

  return sendProxyResponse(backendResponse, res);
});

// GET /api/search-suggestions
app.get("/api/search-suggestions", async (req: Request, res: Response) => {
  const { search } = req.query;

  let backendResponse;
  try {
    backendResponse = await backendFetch({
      endpoint: `${API_ENDPOINT_SEARCH_SUGGESTIONS}?search=${search}`,
    });
  } catch {
    return res.status(500).json({ errors: ["backend_fetch_failed"] });
  }

  return sendProxyResponse(backendResponse, res);
});

// POST /api/create-pin (multipart/form-data — body is piped through raw)
app.post("/api/create-pin", async (req: Request, res: Response) => {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE_KEY];
  if (!accessToken) {
    return res.status(401).json({ errors: ["missing_access_token"] });
  }

  const body = await collectBody(req);
  const contentType = req.headers["content-type"];

  let backendResponse;
  try {
    backendResponse = await backendFetch({
      endpoint: API_ENDPOINT_CREATE_PIN,
      method: "POST",
      body,
      headers: contentType ? { "Content-Type": contentType } : {},
      accessToken,
    });
  } catch {
    return res.status(500).json({ errors: ["backend_fetch_failed"] });
  }

  return sendProxyResponse(backendResponse, res);
});

// POST /api/save-pin
app.post("/api/save-pin", async (req: Request, res: Response) => {
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE_KEY];
  if (!accessToken) {
    return res.status(401).json({ errors: ["missing_access_token"] });
  }

  const { pin_id, board_id } = req.body;

  let backendResponse;
  try {
    backendResponse = await backendFetch({
      endpoint: API_ENDPOINT_SAVE_PIN,
      method: "POST",
      body: JSON.stringify({ pin_id, board_id }),
      headers: { "Content-Type": "application/json" },
      accessToken,
    });
  } catch {
    return res.status(500).json({ errors: ["backend_fetch_failed"] });
  }

  return sendProxyResponse(backendResponse, res);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
