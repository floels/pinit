import { render, screen } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import PinCreationToolPage from "./PinCreationToolPage";
import { AuthContext } from "@/contexts/authContext";

vi.mock("@/components/PinCreationView/PinCreationViewContainer", () => {
  const MockedPinCreationViewContainer = () => (
    <div data-testid="pin-creation-view-container" />
  );
  MockedPinCreationViewContainer.displayName = "PinCreationViewContainer";
  return { default: MockedPinCreationViewContainer };
});

const renderComponent = ({
  accessToken = null,
  isPromptingLogin = false,
}: { accessToken?: string | null; isPromptingLogin?: boolean } = {}) => {
  const router = createMemoryRouter(
    [
      { path: "/", element: <div>Home</div> },
      { path: "/pin-creation-tool", element: <PinCreationToolPage /> },
    ],
    { initialEntries: ["/pin-creation-tool"] },
  );

  render(
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken: vi.fn(),
        isAuthInitialized: true,
        isPromptingLogin,
        clearSession: vi.fn(),
        endSession: vi.fn(),
        stopPromptingLogin: vi.fn(),
      }}
    >
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  );
};

it("redirects to home when not authenticated", () => {
  renderComponent();

  screen.getByText("Home");
});

it("renders pin creation view when authenticated", () => {
  renderComponent({ accessToken: "mock-access-token" });

  screen.getByTestId("pin-creation-view-container");
});

it("holds the route while the app asks for a login", () => {
  // The login modal comes from the header shell, and a successful login must
  // land the user back on this page. So the URL must survive.
  renderComponent({ isPromptingLogin: true });

  expect(screen.queryByText("Home")).toBeNull();
  expect(screen.queryByTestId("pin-creation-view-container")).toBeNull();
});

it("redirects home when the app is not asking for a login", () => {
  renderComponent({ isPromptingLogin: false });

  screen.getByText("Home");
});
