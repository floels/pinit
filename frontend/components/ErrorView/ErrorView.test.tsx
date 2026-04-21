import en from "@/public/locales/en/Common.json";
import ErrorView from "./ErrorView";
import { render, screen } from "@testing-library/react";

it("translates error message", () => {
  render(<ErrorView errorMessageKey="Common.UNFORESEEN_ERROR" />);

  screen.getByText(en.UNFORESEEN_ERROR);
});
