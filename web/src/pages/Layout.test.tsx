import { render, screen } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Layout from "./Layout";
import { AuthContext } from "@/contexts/authContext";
import { USERNAME_LOCAL_STORAGE_KEY } from "@/lib/constants";
import { withQueryClient } from "@/lib/testing-utils/misc";

const renderComponent = ({
  accessToken = null,
  isAuthInitialized = true,
}: { accessToken?: string | null; isAuthInitialized?: boolean } = {}) => {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [{ path: "/", element: <div>Route content</div> }],
      },
    ],
    { initialEntries: ["/"] },
  );

  render(
    withQueryClient(
      <AuthContext.Provider
        value={{
          accessToken,
          setAccessToken: vi.fn(),
          isAuthInitialized,
          isPromptingLogin: false,
          clearSession: vi.fn(),
          endSession: vi.fn(),
          stopPromptingLogin: vi.fn(),
        }}
      >
        <RouterProvider router={router} />
      </AuthContext.Provider>,
    ),
  );
};

beforeEach(() => {
  localStorage.clear();
});

it("renders the authenticated header while the startup refresh is pending and a username is cached", () => {
  // A reload destroys the in-memory access token, so the first render happens
  // before the app knows whether the session is alive. A cached username means
  // that this browser was logged in, so the header must not offer a log in.
  localStorage.setItem(USERNAME_LOCAL_STORAGE_KEY, "john.doe");

  renderComponent({ isAuthInitialized: false });

  screen.getByTestId("sidebar-home-link");
  screen.getByTestId("profile-link-icon");
  expect(screen.queryByText("Log in")).toBeNull();
});

it("keeps the routed page behind the spinner while the startup refresh is pending", () => {
  // The guess covers the shell only. The page needs a real access token.
  localStorage.setItem(USERNAME_LOCAL_STORAGE_KEY, "john.doe");

  renderComponent({ isAuthInitialized: false });

  expect(screen.queryByText("Route content")).toBeNull();
});

it("renders the unauthenticated header once the startup refresh gave no token", () => {
  // A cached username is a guess, not a credential. Only logout clears it, so a
  // refresh cookie that expired on its own leaves the username behind. Once the
  // refresh has settled, the token decides and the guess must not survive.
  localStorage.setItem(USERNAME_LOCAL_STORAGE_KEY, "john.doe");

  renderComponent({ isAuthInitialized: true, accessToken: null });

  screen.getByText("Log in");
  expect(screen.queryByTestId("sidebar-home-link")).toBeNull();
});

it("renders the unauthenticated header for a visitor with no cached username", () => {
  renderComponent({ isAuthInitialized: false });

  screen.getByText("Log in");
  expect(screen.queryByTestId("sidebar-home-link")).toBeNull();
});

it("renders the authenticated header when an access token exists", () => {
  renderComponent({ accessToken: "mock-access-token" });

  screen.getByTestId("sidebar-home-link");
  screen.getByText("Route content");
});
