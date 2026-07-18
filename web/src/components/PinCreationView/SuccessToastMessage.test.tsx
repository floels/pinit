import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SuccessToastMessage from "./SuccessToastMessage";

it("renders link with proper 'href' attribute", () => {
  render(
    <MemoryRouter>
      <SuccessToastMessage pinId="123456789" />
    </MemoryRouter>,
  );

  const link = screen.getByRole("link") as HTMLAnchorElement;

  expect(link.href).toMatch(/\/pin\/123456789$/);
});
