import { API_BASE_URL } from "../constants";
import { ResponseKOError } from "../customErrors";

export const fetchWithAuthentication = ({
  endpoint,
  accessToken,
  fetchOptions,
}: {
  endpoint: string;
  accessToken: string;
  fetchOptions?: RequestInit;
}) => {
  return fetch(`${API_BASE_URL}/${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...fetchOptions?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const throwIfKO = (response: Response) => {
  if (!response.ok) {
    throw new ResponseKOError();
  }
};
