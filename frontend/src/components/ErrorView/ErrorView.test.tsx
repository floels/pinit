import ErrorView from "./ErrorView";
import { render, screen } from "@testing-library/react";

it("renders error message", () => {
  render(<ErrorView message="Something went wrong." />);

  screen.getByText("Something went wrong.");
});
