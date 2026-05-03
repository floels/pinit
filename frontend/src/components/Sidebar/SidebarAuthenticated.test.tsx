import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SidebarAuthenticated from "./SidebarAuthenticated";

const renderComponent = (pathname = "/") => {
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <SidebarAuthenticated />
    </MemoryRouter>,
  );
};

it("when on home route, marks home link as active and not create link", () => {
  renderComponent("/");

  const homeLink = screen.getByTestId("sidebar-home-link");
  expect(homeLink).toHaveClass("navItemActive");

  const createLink = screen.getByTestId("sidebar-create-link");
  expect(createLink).not.toHaveClass("navItemActive");
});

it("when on pin creation route, marks create link as active and not home link", () => {
  renderComponent("/pin-creation-tool");

  const homeLink = screen.getByTestId("sidebar-home-link");
  expect(homeLink).not.toHaveClass("navItemActive");

  const createLink = screen.getByTestId("sidebar-create-link");
  expect(createLink).toHaveClass("navItemActive");
});
