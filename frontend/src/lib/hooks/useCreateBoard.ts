import { useMutation } from "@tanstack/react-query";
import { API_URL_CREATE_BOARD } from "../constants";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { throwIfKO } from "../utils/fetch";
import { BoardFromAPI } from "../types/backendTypes";

type CreateBoardVariables = { name: string; pinId: string };

export const useCreateBoard = () => {
  const fetchWithAuth = useFetchWithAuth();

  return useMutation({
    mutationFn: async ({ name, pinId }: CreateBoardVariables) => {
      const response = await fetchWithAuth(API_URL_CREATE_BOARD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin_id: pinId }),
      });
      throwIfKO(response);
      const data: BoardFromAPI = await response.json();
      return { id: data.unique_id, name: data.name, slug: data.slug };
    },
  });
};
