import { useMutation } from "@tanstack/react-query";
import { API_URL_PIN_DETAILS } from "../constants";
import { throwIfKO } from "../utils/fetch";

type SavePinVariables = { pinId: string; boardId: string };

export const useSavePin = () => {
  return useMutation({
    mutationFn: async ({ pinId, boardId }: SavePinVariables) => {
      const response = await fetch(`${API_URL_PIN_DETAILS}/${pinId}/saves/`, {
        method: "POST",
        body: JSON.stringify({ board_id: boardId }),
      });
      throwIfKO(response);
    },
  });
};
