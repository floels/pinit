import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import HeaderAuthenticated from "./HeaderAuthenticated";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";

const renderComponent = ({ initial = null }: { initial?: string | null } = {}) => {
  const props = {
    username: "johndoe",
    initial,
    profilePictureURL: null,
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

it("displays the initial in the profile badge when no profile picture is set", () => {
  renderComponent({ initial: "J" });

  expect(screen.getByTestId("profile-link")).toHaveTextContent("J");
  expect(screen.queryByTestId("profile-link-icon")).toBeNull();
});

it("displays the fallback icon in the profile badge when no initial and no profile picture", () => {
  renderComponent({ initial: null });

  screen.getByTestId("profile-link-icon");
});
