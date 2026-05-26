import { useMutation } from "@tanstack/react-query";
import { API_URL_SAVE_PIN } from "../constants";
import { throwIfKO } from "../utils/fetch";

type SavePinVariables = { pinId: string; boardId: string };

export const useSavePin = () => {
  return useMutation({
    mutationFn: async ({ pinId, boardId }: SavePinVariables) => {
      const response = await fetch(API_URL_SAVE_PIN, {
        method: "POST",
        body: JSON.stringify({ pin_id: pinId, board_id: boardId }),
      });
      throwIfKO(response);
    },
  });
};
