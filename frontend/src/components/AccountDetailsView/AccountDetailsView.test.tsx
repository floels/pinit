import { render, screen } from "@testing-library/react";
import AccountDetailsView from "./AccountDetailsView";
import en from "@/public/locales/en/AccountDetails.json";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_ENDPOINT_ACCOUNT_DETAILS } from "@/lib/constants";

const account = MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_ACCOUNT_DETAILS];

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
