import { isValidBirthdate } from "./validation";

describe("'isValidBirthdate' function", () => {
  // We cover this specific case here because it is hard to simulate
  // in the <SignupForm /> component:
  it("should return 'false' for input '2000-02-30'", () => {
    expect(isValidBirthdate("2020-02-30")).toEqual(false);
  });
});
