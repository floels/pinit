import { useMutation } from "@tanstack/react-query";
import { API_URL_UPDATE_PIN } from "../constants";
import { useAPI } from "@/lib/api/useAPI";
import { throwIfKO } from "../utils/fetch";

export const useDeletePin = () => {
  const { fetchAuthenticated } = useAPI();

  return useMutation({
    mutationFn: async (pinId: string) => {
      const response = await fetchAuthenticated(
        `${API_URL_UPDATE_PIN}/${pinId}/`,
        {
          method: "DELETE",
        },
      );
      throwIfKO(response);
    },
  });
};
