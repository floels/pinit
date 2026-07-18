import { ellipsizeText } from "./strings";

describe("ellipsizeText", () => {
  it("returns the same text if under the maxLength", () => {
    const text = "Hello";
    const maxLength = 10;
    const result = ellipsizeText({ text, maxLength });
    expect(result).toBe(text);
  });

  it("returns ellipsized text if over the maxLength", () => {
    const text = "Hello, world!";
    const maxLength = 5;
    const expected = "Hello...";
    const result = ellipsizeText({ text, maxLength });
    expect(result).toBe(expected);
  });

  it("returns the text unaltered if exactly the maxLength", () => {
    const text = "Hello";
    const maxLength = 5;
    const result = ellipsizeText({ text, maxLength });
    expect(result).toBe(text);
  });

  it("handles empty string input correctly", () => {
    const text = "";
    const maxLength = 5;
    const result = ellipsizeText({ text, maxLength });
    expect(result).toBe(text);
  });

  it("throws an error for negative maxLength", () => {
    const text = "Hello, world!";
    const maxLength = -5;

    // Use a function wrapper to catch the error thrown
    const resultFn = () => ellipsizeText({ text, maxLength });

    // Check if the error is thrown
    expect(resultFn).toThrow("Error: maxLength must be greater than 0.");
  });
});
