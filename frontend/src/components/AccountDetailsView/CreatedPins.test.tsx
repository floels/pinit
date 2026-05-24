import { render, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreatedPins from "./CreatedPins";
import { AccountContext } from "@/contexts/accountContext";
import { AuthContext } from "@/contexts/authContext";
import { ToastContainer } from "react-toastify";
import { mockIntersectionObserver } from "@/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
  CREATED_PINS_URL,
} from "@/lib/testing-utils/mockAPIResponses";
import {
  API_URL_MY_ACCOUNT_DETAILS,
  API_URL_CREATED_PINS,
} from "@/lib/constants";
import en from "@/public/locales/en/CreatedPins.json";

const account = MOCK_API_RESPONSES_SERIALIZED[API_URL_MY_ACCOUNT_DETAILS];
const createdPins = MOCK_API_RESPONSES_SERIALIZED[CREATED_PINS_URL].results;

const accountContext = {
  account,
  setAccount: () => {},
};

const authContext = {
  accessToken: "mock.access.token",
  setAccessToken: () => {},
  isAuthInitialized: true,
};

const VIEWPORT_WIDTH_PX = 1200;

Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: VIEWPORT_WIDTH_PX,
});

beforeEach(() => {
  mockIntersectionObserver();
});

const renderComponent = (username = "johndoe") => {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={authContext}>
        <AccountContext.Provider value={accountContext}>
          <ToastContainer />
          <CreatedPins username={username} />
        </AccountContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
};

it("fetches created pins from the correct endpoint", async () => {
  const createdPinsUrl = `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`;

  fetchMock.mockOnceIf(createdPinsUrl, MOCK_API_RESPONSES[CREATED_PINS_URL]);

  renderComponent("johndoe");

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(createdPinsUrl);
  });
});

it("renders pin thumbnails and titles after successful fetch", async () => {
  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`,
    MOCK_API_RESPONSES[CREATED_PINS_URL],
  );

  renderComponent("johndoe");

  await waitFor(() => {
    const thumbnails = screen.getAllByTestId("created-pin-thumbnail");
    expect(thumbnails).toHaveLength(createdPins.length);
  });

  // All pin titles should be visible
  for (const pin of createdPins) {
    if (pin.title) {
      screen.getByText(pin.title);
    }
  }
});

it("shows loading spinner while fetching", async () => {
  const eternalPromise = new Promise<Response>(() => {});
  fetchMock.mockImplementationOnce(() => eternalPromise);

  renderComponent("johndoe");

  // The first fetch triggers immediately on mount
  // (the sentinel fires but boardIsEmpty=true, so it won't trigger scroll)
  // We need to wait a tick and check for the spinner
  await waitFor(() => {
    screen.getByTestId("created-pins-loading-spinner");
  });
});

it("shows error message on failed fetch", async () => {
  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`,
    "{}",
    { status: 500 },
  );

  renderComponent("johndoe");

  await waitFor(() => {
    screen.getByText(en.ERROR_FETCH_CREATED_PINS);
  });
});

it("shows empty message when no pins are returned", async () => {
  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`,
    JSON.stringify({ results: [] }),
  );

  renderComponent("johndoe");

  await waitFor(() => {
    screen.getByText(en.EMPTY_CREATED_PINS);
  });
});

it("shows edit button only for own profile", async () => {
  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`,
    MOCK_API_RESPONSES[CREATED_PINS_URL],
  );

  renderComponent("johndoe"); // account.username === "johndoe"

  await waitFor(() => {
    const editButtons = screen.getAllByTestId("created-pin-edit-button");
    expect(editButtons).toHaveLength(createdPins.length);
  });
});

it("does not show edit button for other users' profiles", async () => {
  const otherAccountContext = {
    account: { ...account, username: "anotherusername" },
    setAccount: () => {},
  };

  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`,
    MOCK_API_RESPONSES[CREATED_PINS_URL],
  );

  render(
    <MemoryRouter>
      <AuthContext.Provider value={authContext}>
        <AccountContext.Provider value={otherAccountContext}>
          <ToastContainer />
          <CreatedPins username="johndoe" />
        </AccountContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  await waitFor(() => {
    screen.getAllByTestId("created-pin-thumbnail");
  });

  expect(screen.queryByTestId("created-pin-edit-button")).toBeNull();
});
