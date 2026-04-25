import { ellipsizeText, appendQueryParam } from "./strings";

describe("ellipsizeText", () => {
  it("returns the original text when shorter than maxLength", () => {
    expect(ellipsizeText({ text: "hello", maxLength: 10 })).toBe("hello");
  });

  it("returns the original text when equal to maxLength", () => {
    expect(ellipsizeText({ text: "hello", maxLength: 5 })).toBe("hello");
  });

  it("truncates and appends '...' when text exceeds maxLength", () => {
    expect(ellipsizeText({ text: "hello world", maxLength: 5 })).toBe(
      "hello...",
    );
  });

  it("throws when maxLength is 0", () => {
    expect(() => ellipsizeText({ text: "hello", maxLength: 0 })).toThrow();
  });
});

describe("appendQueryParam", () => {
  it("uses '?' when the URL has no existing query params", () => {
    expect(
      appendQueryParam({ url: "/search", key: "q", value: "cats" }),
    ).toBe("/search?q=cats");
  });

  it("uses '&' when the URL already has query params", () => {
    expect(
      appendQueryParam({ url: "/search?page=2", key: "q", value: "cats" }),
    ).toBe("/search?page=2&q=cats");
  });

  it("URL-encodes the value", () => {
    expect(
      appendQueryParam({ url: "/search", key: "q", value: "cats & dogs" }),
    ).toBe("/search?q=cats%20%26%20dogs");
  });
});
