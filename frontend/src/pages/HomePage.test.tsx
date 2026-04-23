import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import HomePage from "./HomePage";
import { withQueryClient, mockIntersectionObserver } from "@/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_PIN_SUGGESTIONS } from "@/lib/constants";
import { AuthContext } from "@/contexts/authContext";
import en from "@/public/locales/en/HomePageContent.json";

jest.mock("@/components/LandingPageContent/LandingPageContent", () => {
  const MockedLandingPageContent = () => (
    <div data-testid="landing-page-content" />
  );
  MockedLandingPageContent.displayName = "LandingPageContent";
  return MockedLandingPageContent;
});

const mockAccessToken = "mock-access-token";

const renderComponent = ({ accessToken = null }: { accessToken?: string | null } = {}) => {
  const router = createMemoryRouter(
    [{ path: "/", element: <HomePage /> }],
    { initialEntries: ["/"] },
  );

  render(
    withQueryClient(
      <AuthContext.Provider value={{ accessToken, setAccessToken: jest.fn() }}>
        <RouterProvider router={router} />
      </AuthContext.Provider>,
    ),
  );
};

beforeEach(() => {
  fetchMock.resetMocks();
  mockIntersectionObserver();
});

it("renders landing page content when not authenticated", () => {
  renderComponent();

  screen.getByTestId("landing-page-content");
});

it("fetches pin suggestions from the correct endpoint when authenticated", () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_PIN_SUGGESTIONS]);

  renderComponent({ accessToken: mockAccessToken });

  expect(fetch).toHaveBeenCalledWith(API_URL_PIN_SUGGESTIONS, {
    headers: { Authorization: `Bearer ${mockAccessToken}` },
  });
});

it("renders pins upon successful fetch", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_PIN_SUGGESTIONS]);

  renderComponent({ accessToken: mockAccessToken });

  await waitFor(() => {
    screen.getByText(
      MOCK_API_RESPONSES_JSON[API_URL_PIN_SUGGESTIONS].results[0].title,
    );
  });
});

it("renders error view upon failed fetch", async () => {
  fetchMock.mockResponseOnce("{}", { status: 500 });

  renderComponent({ accessToken: mockAccessToken });

  await waitFor(() => {
    screen.getByText(en.ERROR_FETCH_PIN_SUGGESTIONS);
  });
});
