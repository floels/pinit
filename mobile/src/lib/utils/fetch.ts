import { ResponseKOError } from "@/src/lib/customErrors";

export const throwIfKO = (response: Response) => {
  if (!response.ok) {
    throw new ResponseKOError();
  }
};
