import { render, screen } from "@testing-library/react-native";

import PinThumbnail from "./PinThumbnail";

import { API_ENDPOINT_PIN_SUGGESTIONS } from "@/src/lib/constants";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/src/lib/testing-utils/mockAPIResponses";

const pin =
  MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_PIN_SUGGESTIONS].results[0];

const pinImageWidth = 100;
const pinImageAspectRatio = 1.5;

const renderComponent = (props?: any) => {
  render(
    <PinThumbnail
      pin={pin}
      width={pinImageWidth}
      pinImageAspectRatio={pinImageAspectRatio}
      {...props}
    />,
  );
};

it("displays all relevant data", () => {
  renderComponent();

  const pinImage = screen.getByTestId("pin-thumbnail-pin-image");
  expect(pinImage).toHaveProp("source", { uri: pin.imageURL });
  expect(pinImage).toHaveProp("width", pinImageWidth);
  expect(pinImage).toHaveProp("height", pinImageWidth / pinImageAspectRatio);

  screen.getByText(pin.title);

  const profilePicture = screen.getByTestId(
    "pin-thumbnail-author-profile-picture",
  );
  expect(profilePicture).toHaveProp("source", {
    uri: pin.author.profilePictureURL,
  });

  screen.getByText(pin.author.displayName);
});

it("displays author's name but not their profile picture if its URL was not provided", () => {
  const pinWithoutAuthorProfilePicture = {
    ...pin,
    author: { ...pin.author, profilePictureURL: null },
  };

  renderComponent({ pin: pinWithoutAuthorProfilePicture });

  screen.getByText(pin.author.displayName);
  expect(
    screen.queryByTestId("pin-thumbnail-author-profile-picture"),
  ).toBeNull();
});
