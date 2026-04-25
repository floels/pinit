import { throwIfKO } from "./fetch";
import { ResponseKOError } from "../customErrors";

describe("throwIfKO", () => {
  it("does not throw for an ok response", () => {
    const ok = { ok: true } as Response;

    expect(() => throwIfKO(ok)).not.toThrow();
  });

  it("throws ResponseKOError for a non-ok response", () => {
    const notOk = { ok: false } as Response;

    expect(() => throwIfKO(notOk)).toThrow(ResponseKOError);
  });
});
