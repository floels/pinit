import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeaderAuthenticated from "./HeaderAuthenticated";
import en from "@/public/locales/en/HeaderAuthenticated.json";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import { createRef } from "react";

const renderComponent = (pathname = "/en") => {
  const props = {
    username: "johndoe",
    profilePictureURL: null,
    isProfileLinkHovered: false,
    isAccountOptionsButtonHovered: false,
    isAccountOptionsFlyoutOpen: false,
    handleMouseEnterProfileLink: jest.fn(),
    handleMouseLeaveProfileLink: jest.fn(),
    handleClickAccountOptionsButton: jest.fn(),
    handleMouseEnterAccountOptionsButton: jest.fn(),
    handleMouseLeaveAccountOptionsButton: jest.fn(),
    handleClickOutOfAccountOptionsFlyout: jest.fn(),
  };

  const mockRef = createRef<HTMLButtonElement>();

  render(
    <MemoryRouter initialEntries={[pathname]}>
      <HeaderSearchBarContextProvider>
        <HeaderAuthenticated ref={mockRef} {...props} />
      </HeaderSearchBarContextProvider>
    </MemoryRouter>,
  );
};

it("when on home route, should mark home link as active and not mark create link as active", () => {
  renderComponent("/en");

  const homeLink = screen.getByText(en.NAV_ITEM_HOME);
  expect(homeLink).toHaveClass("navigationItemActive");

  const createLink = screen.getByText(en.NAV_ITEM_CREATE);
  expect(createLink).not.toHaveClass("navigationItemActive");
});

it("when on pin creation route, should mark create link as active and not mark home link as active", () => {
  renderComponent("/en/pin-creation-tool");

  const homeLink = screen.getByText(en.NAV_ITEM_HOME);
  expect(homeLink).not.toHaveClass("navigationItemActive");

  const createLink = screen.getByText(en.NAV_ITEM_CREATE);
  expect(createLink).toHaveClass("navigationItemActive");
});
