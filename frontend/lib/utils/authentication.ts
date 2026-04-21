import { ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY } from "../constants";

export const setAccessTokenExpirationDate = (expirationDate: string) => {
  if (!localStorage) {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY,
    expirationDate,
  );
};
