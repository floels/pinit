import { render, screen, waitFor } from "@testing-library/react-native";

import AuthorScreen from "./AuthorScreen";

import {
  API_BASE_URL,
  API_ENDPOINT_ACCOUNT_DETAILS,
} from "@/src/lib/constants";
import { pressButton, withQueryClient } from "@/src/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
  MOCK_API_RESPONSES_JSON,
} from "@/src/lib/testing-utils/mockAPIResponses";
import { Account } from "@/src/lib/types";

const accountWithPublicDetails =
  MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_ACCOUNT_DETAILS];

const {
  boards,
  initial,
  backgroundPictureURL,
  description,
  ...providedAccount
} = accountWithPublicDetails;

const providedAccountWithoutProfilePicture = {
  ...providedAccount,
  profilePictureURL: null,
};

const mockNavigation = { goBack: jest.fn() } as any;

const endpointURL = `${API_BASE_URL}/${API_ENDPOINT_ACCOUNT_DETAILS}/${providedAccount.username}/`;

const renderComponent = ({
  account = providedAccount,
}: { account?: Account } = {}) => {
  const route = { params: { author: account } } as any;

  render(
    withQueryClient(<AuthorScreen route={route} navigation={mockNavigation} />),
  );
};

beforeEach(() => {
  // Since we have animation in the component (in skeletons):
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllTimers();
});

it(`renders provided information and loading state 
for background picture initially`, () => {
  const eternalPromise = new Promise<Response>(() => {});

  fetchMock.mockImplementationOnce(() => eternalPromise);

  renderComponent();

  screen.getByTestId("background-picture-skeleton");

  const profilePicture = screen.getByTestId("account-profile-picture");
  expect(profilePicture).toHaveProp("source", {
    uri: providedAccount.profilePictureURL,
  });

  screen.getByText(providedAccount.displayName);
  screen.getByText(providedAccount.username);
});

it(`renders background picture and description, and hides skeleton
upon successful response`, async () => {
  fetchMock.mockOnceIf(
    endpointURL,
    MOCK_API_RESPONSES[API_ENDPOINT_ACCOUNT_DETAILS],
  );

  renderComponent();

  await waitFor(() => {
    screen.getByText(description);

    const backgroundPicture = screen.getByTestId("account-background-picture");
    expect(backgroundPicture).toHaveProp("source", {
      uri: accountWithPublicDetails.backgroundPictureURL,
    });

    expect(screen.queryByTestId("background-picture-skeleton")).toBeNull();
  });
});

it(`in case account has no profile picture, displays skeleton
for profile picture initially, and does not display skeleton
for backgroud picture`, async () => {
  renderComponent({ account: providedAccountWithoutProfilePicture });

  screen.queryByTestId("account-profile-picture-skeleton");

  expect(screen.queryByTestId("background-picture-skeleton")).toBeNull();
});

it(`in case account has no profile picture, hides skeleton,
displays account's initial, and does not display background picture
upon successful fetch`, async () => {
  const response = {
    ...MOCK_API_RESPONSES_JSON[API_ENDPOINT_ACCOUNT_DETAILS],
    profile_picture_url: null,
  };

  fetchMock.mockOnceIf(endpointURL, JSON.stringify(response));

  renderComponent({ account: providedAccountWithoutProfilePicture });

  await waitFor(() => {
    screen.getByText(response.initial);

    expect(screen.queryByTestId("account-background-picture")).toBeNull();
  });
});

it("calls 'navigation.goBack' upon pressing back button", () => {
  renderComponent();

  pressButton({ testID: "account-details-view-back-button" });

  expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
});
