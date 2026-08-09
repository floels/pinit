import { useMutation } from "@tanstack/react-query";
import { API_URL_PIN_DETAILS } from "../constants";
import { useAPI } from "@/lib/api/useAPI";
import { throwIfKO } from "../utils/fetch";

type SavePinVariables = { pinId: string; boardId: string };

export const useSavePin = () => {
  const { fetchAuthenticated } = useAPI();

  return useMutation({
    mutationFn: async ({ pinId, boardId }: SavePinVariables) => {
      const response = await fetchAuthenticated(
        `${API_URL_PIN_DETAILS}/${pinId}/saves/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board_id: boardId }),
        },
      );
      throwIfKO(response);
    },
  });
};
