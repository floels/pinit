import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import CreatedAndSavedPins from "./CreatedAndSavedPins";
import { AccountContext } from "@/contexts/accountContext";
import { AuthContext } from "@/contexts/authContext";
import { withQueryClient } from "@/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
  CREATED_PINS_URL,
} from "@/lib/testing-utils/mockAPIResponses";
import {
  API_URL_ACCOUNT_DETAILS,
  API_URL_MY_ACCOUNT_DETAILS,
} from "@/lib/constants";
import en from "@/public/locales/en/AccountDetails.json";

const account = MOCK_API_RESPONSES_SERIALIZED[API_URL_ACCOUNT_DETAILS];
const createdPins = MOCK_API_RESPONSES_SERIALIZED[CREATED_PINS_URL].results;

const accountContext = {
  account: MOCK_API_RESPONSES_SERIALIZED[API_URL_MY_ACCOUNT_DETAILS],
  setAccount: () => {},
  isFetchError: false,
};

const authContext = {
  accessToken: "mock.access.token",
  setAccessToken: () => {},
  isAuthInitialized: true,
};

const renderComponent = () => {
  render(
    withQueryClient(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <AccountContext.Provider value={accountContext}>
            <CreatedAndSavedPins account={account} />
          </AccountContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    ),
  );
};

beforeEach(() => {
  fetchMock.mockResponse(MOCK_API_RESPONSES[CREATED_PINS_URL]);
});

it("renders the created pins tab by default", async () => {
  renderComponent();

  expect(screen.getByText(en.TAB_CREATED)).not.toHaveClass(
    "tabButtonInactive",
  );
  expect(screen.getByText(en.TAB_SAVED)).toHaveClass("tabButtonInactive");

  await waitFor(() => {
    const thumbnails = screen.getAllByTestId("pin-thumbnail");
    expect(thumbnails).toHaveLength(createdPins.length);
  });

  expect(screen.queryByTestId("board-thumbnail-cover-picture")).toBeNull();
});

it("renders the boards when the user clicks the saved tab", async () => {
  renderComponent();

  await waitFor(() => {
    screen.getAllByTestId("pin-thumbnail");
  });

  await userEvent.click(screen.getByText(en.TAB_SAVED));

  const coverPictures = screen.getAllByTestId("board-thumbnail-cover-picture");
  expect(coverPictures).toHaveLength(account.boards.length);

  for (const board of account.boards) {
    screen.getByText(board.name);
  }

  expect(screen.queryByTestId("pin-thumbnail")).toBeNull();
  expect(screen.getByText(en.TAB_CREATED)).toHaveClass("tabButtonInactive");
});

it("renders the created pins again when the user clicks back on the created tab", async () => {
  renderComponent();

  await userEvent.click(screen.getByText(en.TAB_SAVED));

  await userEvent.click(screen.getByText(en.TAB_CREATED));

  await waitFor(() => {
    const thumbnails = screen.getAllByTestId("pin-thumbnail");
    expect(thumbnails).toHaveLength(createdPins.length);
  });

  expect(screen.queryByTestId("board-thumbnail-cover-picture")).toBeNull();
});
