export const API_BASE_URL =
  process.env.ENVIRONMENT === "staging"
    ? "http://pinit-api-staging.eu-north-1.elasticbeanstalk.com/api"
    : (process.env.BACKEND_URL ?? "http://127.0.0.1:8000/api");

export const API_ROUTE_SIGN_UP = `${API_BASE_URL}/signup/web/`;
export const API_ROUTE_OBTAIN_TOKEN = `${API_BASE_URL}/token/web/obtain/`;
export const API_ROUTE_OBTAIN_DEMO_TOKEN = `${API_BASE_URL}/token/web/obtain-demo/`;
export const API_ROUTE_REFRESH_TOKEN = `${API_BASE_URL}/token/web/refresh/`;
export const API_ROUTE_LOG_OUT = `${API_BASE_URL}/token/web/logout/`;

export const API_ROUTE_MY_ACCOUNT_DETAILS = `${API_BASE_URL}/accounts/me/`;
export const API_ROUTE_PIN_SUGGESTIONS = `${API_BASE_URL}/pin-suggestions/`;
export const API_ROUTE_SEARCH = `${API_BASE_URL}/search/`;
export const API_ROUTE_SEARCH_SUGGESTIONS = `${API_BASE_URL}/search-suggestions/`;
export const API_ROUTE_CREATE_PIN = `${API_BASE_URL}/create-pin/`;
export const API_ROUTE_SAVE_PIN = `${API_BASE_URL}/save-pin/`;

export const API_ENDPOINT_PIN_DETAILS = "pins";
export const API_ENDPOINT_ACCOUNT_DETAILS = "accounts";
export const API_ENDPOINT_BOARD_DETAILS = "boards";
export const API_ENDPOINT_SEARCH_PINS = "search/";

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

export const USERNAME_LOCAL_STORAGE_KEY = "username";
export const PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY = "profilePictureURL";
