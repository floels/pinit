export const API_BASE_URL =
  process.env.BACKEND_URL ?? "http://127.0.0.1:8000/api";

export const API_URL_SIGN_UP = `${API_BASE_URL}/signup/web/`;
export const API_URL_OBTAIN_TOKEN = `${API_BASE_URL}/token/web/obtain/`;
export const API_URL_REFRESH_TOKEN = `${API_BASE_URL}/token/web/refresh/`;
export const API_URL_LOG_OUT = `${API_BASE_URL}/token/web/logout/`;

export const API_URL_MY_ACCOUNT_DETAILS = `${API_BASE_URL}/accounts/me/`;
export const API_URL_PIN_SUGGESTIONS = `${API_BASE_URL}/pin-suggestions/`;
export const API_URL_SEARCH = `${API_BASE_URL}/search/`;
export const API_URL_SEARCH_SUGGESTIONS = `${API_BASE_URL}/search-suggestions/`;
export const API_URL_PIN_IMAGE_UPLOAD_URL = `${API_BASE_URL}/pin-image-upload-url/`;
export const API_URL_CREATE_PIN = `${API_BASE_URL}/create-pin/`;
export const API_URL_SAVE_PIN = `${API_BASE_URL}/save-pin/`;

export const API_URL_PIN_DETAILS = `${API_BASE_URL}/pins`;
export const API_URL_ACCOUNT_DETAILS = `${API_BASE_URL}/accounts`;
export const API_URL_BOARD_DETAILS = `${API_BASE_URL}/boards`;

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
