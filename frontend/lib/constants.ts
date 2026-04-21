// API routes
export const API_ROUTE_SIGN_UP = "/api/user/sign-up";
export const API_ROUTE_OBTAIN_TOKEN = "/api/user/obtain-token";
export const API_ROUTE_OBTAIN_DEMO_TOKEN = "/api/user/obtain-demo-token";
export const API_ROUTE_REFRESH_TOKEN = "/api/user/refresh-token";
export const API_ROUTE_OWNED_ACCOUNTS = "/api/user/owned-accounts";
export const API_ROUTE_MY_ACCOUNT_DETAILS = "/api/user/account-details";
export const API_ROUTE_PIN_SUGGESTIONS = "/api/pin-suggestions";
export const API_ROUTE_SEARCH = "/api/search";
export const API_ROUTE_SEARCH_SUGGESTIONS = "/api/search-suggestions";
export const API_ROUTE_CREATE_PIN = "/api/create-pin";
export const API_ROUTE_SAVE_PIN = "/api/save-pin";
export const API_ROUTE_LOG_OUT = "/api/user/log-out";

// API base URL and endpoints
export const API_BASE_URL =
  process.env.ENVIRONMENT === "staging"
    ? "http://pinit-api-staging.eu-north-1.elasticbeanstalk.com/api"
    : (process.env.BACKEND_URL ?? "http://127.0.0.1:8000/api");
export const API_ENDPOINT_OBTAIN_TOKEN = "token/obtain/";
export const API_ENDPOINT_OBTAIN_DEMO_TOKEN = "token/obtain-demo/";
export const API_ENDPOINT_REFRESH_TOKEN = "token/refresh/";
export const API_ENDPOINT_SIGN_UP = "signup/";
export const API_ENDPOINT_PIN_SUGGESTIONS = "pin-suggestions/";
export const API_ENDPOINT_SEARCH_SUGGESTIONS = "search-suggestions/";
export const API_ENDPOINT_SEARCH_PINS = "search/";
export const API_ENDPOINT_PIN_DETAILS = "pins";
export const API_ENDPOINT_ACCOUNT_DETAILS = "accounts";
export const API_ENDPOINT_MY_ACCOUNT_DETAILS = "accounts/me/";
export const API_ENDPOINT_BOARD_DETAILS = "boards";
export const API_ENDPOINT_CREATE_PIN = "create-pin/";
export const API_ENDPOINT_SAVE_PIN = "save-pin/";

// API error codes
export const ERROR_CODE_UNAUTHORIZED = "unauthorized";
export const ERROR_CODE_INVALID_EMAIL = "invalid_email";
export const ERROR_CODE_INVALID_PASSWORD = "invalid_password";
export const ERROR_CODE_INVALID_BIRTHDATE = "invalid_birthdate";
export const ERROR_CODE_EMAIL_ALREADY_SIGNED_UP = "email_already_signed_up";

// Frontend-only error codes
export const ERROR_CODE_FETCH_FAILED = "fetch_failed";
export const ERROR_CODE_BACKEND_FETCH_FAILED = "backend_fetch_failed";
export const ERROR_CODE_UNPARSABLE_BACKEND_RESPONSE =
  "unparsable_backend_response";
export const ERROR_CODE_MISSING_ACCESS_TOKEN = "missing_access_token";
export const ERROR_CODE_MISSING_ACCOUNT_USERNAME_COOKIE =
  "missing_account_username_cookie";

// Cookie and local storage keys
export const ACCESS_TOKEN_COOKIE_KEY = "accessToken";
export const REFRESH_TOKEN_COOKIE_KEY = "refreshToken";
export const ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY =
  "accessTokenExpirationDate";
export const USERNAME_LOCAL_STORAGE_KEY = "username";
export const PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY = "profilePictureURL";
