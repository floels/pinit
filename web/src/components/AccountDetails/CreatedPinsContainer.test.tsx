import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import CreatedPinsContainer from "./CreatedPinsContainer";
import { AccountContext } from "@/contexts/accountContext";
import { AuthContext } from "@/contexts/authContext";
import { ToastContainer } from "react-toastify";
import { withQueryClient } from "@/lib/testing-utils/misc";
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
  isFetchError: false,
};

const authContext = {
  accessToken: "mock.access.token",
  setAccessToken: () => {},
  isAuthInitialized: true,
};


const renderComponent = (username = "johndoe") => {
  render(
    withQueryClient(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <AccountContext.Provider value={accountContext}>
            <ToastContainer />
            <CreatedPinsContainer username={username} />
          </AccountContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    ),
  );
};

it("renders pin thumbnails and titles after successful fetch", async () => {
  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`,
    MOCK_API_RESPONSES[CREATED_PINS_URL],
  );

  renderComponent("johndoe");

  await waitFor(() => {
    const thumbnails = screen.getAllByTestId("pin-thumbnail");
    expect(thumbnails).toHaveLength(createdPins.length);
  });

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
    JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
  );

  renderComponent("johndoe");

  await waitFor(() => {
    screen.getByText(en.EMPTY_CREATED_PINS);
  });
});

it("shows next-page button and fetches page 2 when there is a next page", async () => {
  const page1Response = JSON.stringify({
    count: 10,
    next: `${API_URL_CREATED_PINS}/johndoe/pins/?page=2`,
    previous: null,
    results: MOCK_API_RESPONSES_SERIALIZED[CREATED_PINS_URL].results.map(
      (pin) => ({
        unique_id: pin.id,
        image_url: pin.imageURL,
        title: pin.title,
        description: pin.description ?? "",
        author: {
          username: pin.author.username,
          display_name: pin.author.displayName,
          initial: pin.author.initial,
          profile_picture_url: pin.author.profilePictureURL,
        },
      }),
    ),
  });

  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`,
    page1Response,
  );
  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=2`,
    MOCK_API_RESPONSES[CREATED_PINS_URL],
  );

  renderComponent("johndoe");

  const nextButton = await screen.findByTestId("created-pins-next-page");
  expect(nextButton).not.toBeDisabled();

  await userEvent.click(nextButton);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL_CREATED_PINS}/johndoe/pins/?page=2`,
    );
  });
});

it("shows edit button only for own profile", async () => {
  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`,
    MOCK_API_RESPONSES[CREATED_PINS_URL],
  );

  renderComponent("johndoe"); // account.username === "johndoe"

  await waitFor(() => {
    const editButtons = screen.getAllByTestId("pin-thumbnail-edit-button");
    expect(editButtons).toHaveLength(createdPins.length);
  });
});

it("does not show edit button for other users' profiles", async () => {
  const otherAccountContext = {
    account: { ...account, username: "anotherusername" },
    setAccount: () => {},
    isFetchError: false,
  };

  fetchMock.mockOnceIf(
    `${API_URL_CREATED_PINS}/johndoe/pins/?page=1`,
    MOCK_API_RESPONSES[CREATED_PINS_URL],
  );

  render(
    withQueryClient(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <AccountContext.Provider value={otherAccountContext}>
            <ToastContainer />
            <CreatedPinsContainer username="johndoe" />
          </AccountContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    ),
  );

  await waitFor(() => {
    screen.getAllByTestId("pin-thumbnail");
  });

  expect(screen.queryByTestId("pin-thumbnail-edit-button")).toBeNull();
});
