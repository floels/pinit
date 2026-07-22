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

const renderComponent = ({ accessToken = null }: { accessToken?: string | null } = {}) => {
  const router = createMemoryRouter(
    [
      { path: "/", element: <div>Home</div> },
      { path: "/pin-creation-tool", element: <PinCreationToolPage /> },
    ],
    { initialEntries: ["/pin-creation-tool"] },
  );

  render(
    <AuthContext.Provider value={{ accessToken, setAccessToken: vi.fn() }}>
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
