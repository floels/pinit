import { useMutation } from "@tanstack/react-query";
import { API_URL_UPDATE_PIN } from "../constants";
import { useAPI } from "@/lib/api/useAPI";
import { throwIfKO } from "../utils/fetch";

type UpdatePinVariables = {
  pinId: string;
  title: string | null;
  description: string | null;
};

export const useUpdatePin = () => {
  const { fetchAuthenticated } = useAPI();

  return useMutation({
    mutationFn: async ({ pinId, title, description }: UpdatePinVariables) => {
      const response = await fetchAuthenticated(
        `${API_URL_UPDATE_PIN}/${pinId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        },
      );
      throwIfKO(response);
    },
  });
};
