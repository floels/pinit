import { render, screen } from "@testing-library/react";
import AccountDetailsView from "./AccountDetailsView";
import en from "@/public/locales/en/AccountDetails.json";
import { MOCK_API_RESPONSES_SERIALIZED, CREATED_PINS_URL, MOCK_API_RESPONSES } from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_ACCOUNT_DETAILS } from "@/lib/constants";
import { mockIntersectionObserver } from "@/lib/testing-utils/misc";

const account = MOCK_API_RESPONSES_SERIALIZED[API_URL_ACCOUNT_DETAILS];

beforeEach(() => {
  mockIntersectionObserver();
  fetchMock.mockResponse(MOCK_API_RESPONSES[CREATED_PINS_URL]);
});

it("renders all relevant details", () => {
  render(<AccountDetailsView account={account} />);

  screen.getByText(account.displayName);
  screen.getByText(account.username);
  screen.getByText(account.description);

  const profilePicture = screen.getByAltText(
    `${en.ALT_PROFILE_PICTURE_OF} John Doe`,
  );
  expect(profilePicture.getAttribute("src")).toBe(account.profilePictureURL);

  const backgroundPicture = screen.getByAltText(
    `${en.ALT_BACKGROUND_PICTURE_OF} John Doe`,
  );
  expect(backgroundPicture.getAttribute("src")).toBe(account.backgroundPictureURL);
});

it("displays initial when profile picture is not provided", () => {
  const accountWithoutProfilePictureURL = {
    ...account,
    profilePictureURL: null,
  };

  render(<AccountDetailsView account={accountWithoutProfilePictureURL} />);

  screen.getByText("J");
});
