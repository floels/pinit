// API base URL and endpoints
export const API_BASE_URL = "http://127.0.0.1:8000/api";
export const API_ENDPOINT_OBTAIN_TOKEN = "token/mobile/";
export const API_ENDPOINT_REFRESH_TOKEN = "token/mobile/refresh/";
export const API_ENDPOINT_PIN_SUGGESTIONS = "pins/suggestions/";
export const API_ENDPOINT_SEARCH_SUGGESTIONS = "search/suggestions/";
export const API_ENDPOINT_SEARCH_PINS = "search/";
export const API_ENDPOINT_ACCOUNT_DETAILS = "accounts";
export const API_ENDPOINT_MY_ACCOUNT_DETAILS = "accounts/me/";
export const API_ENDPOINT_CREATE_PIN = "pins/";
export const API_ENDPOINT_PIN_DETAILS = "pins";

// API error codes
export const ERROR_CODE_INVALID_EMAIL = "invalid_email";

// Storage keys
export const ACCESS_TOKEN_STORAGE_KEY = "access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
export const ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY =
  "access_token_expiration_date";
export const PROFILE_PICTURE_URL_STORAGE_KEY = "profile_picture_url";
