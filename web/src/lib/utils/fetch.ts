import { ResponseKOError } from "../customErrors";

export const throwIfKO = (response: Response) => {
  if (!response.ok) {
    throw new ResponseKOError();
  }
};
