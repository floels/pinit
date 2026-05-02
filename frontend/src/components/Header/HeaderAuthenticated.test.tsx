import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeaderAuthenticated from "./HeaderAuthenticated";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";

const renderComponent = () => {
  const props = {
    username: "johndoe",
    profilePictureURL: null,
    account: null,
    isAccountOptionsFlyoutOpen: false,
    handleClickAccountOptionsButton: jest.fn(),
    handleClickOutOfAccountOptionsFlyout: jest.fn(),
  };

  render(
    <MemoryRouter>
      <HeaderSearchBarContextProvider>
        <HeaderAuthenticated {...props} />
      </HeaderSearchBarContextProvider>
    </MemoryRouter>,
  );
};

it("displays the profile link and account options button", () => {
  renderComponent();

  screen.getByTestId("profile-link");
  screen.getByTestId("account-options-button");
});
