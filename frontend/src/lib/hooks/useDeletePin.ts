import { useMutation } from "@tanstack/react-query";
import { API_URL_UPDATE_PIN } from "../constants";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { throwIfKO } from "../utils/fetch";

export const useDeletePin = () => {
  const fetchWithAuth = useFetchWithAuth();

  return useMutation({
    mutationFn: async (pinId: string) => {
      const response = await fetchWithAuth(`${API_URL_UPDATE_PIN}/${pinId}/`, {
        method: "DELETE",
      });
      throwIfKO(response);
    },
  });
};
