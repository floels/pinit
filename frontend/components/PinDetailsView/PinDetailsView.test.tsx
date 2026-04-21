import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PinDetailsView from "./PinDetailsView";
import en from "@/public/locales/en/PinDetails.json";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_ENDPOINT_PIN_DETAILS } from "@/lib/constants";
import { PinWithFullDetails } from "@/lib/types/frontendTypes";

const defaultPin = MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_PIN_DETAILS];

const renderComponent = ({
  pin = defaultPin,
}: { pin?: PinWithFullDetails } = {}) => {
  return render(
    <MemoryRouter>
      <PinDetailsView pin={pin} />
    </MemoryRouter>,
  );
};

it("renders all required elements", () => {
  renderComponent();

  const image = screen.getByAltText(defaultPin.title);
  expect(image).toHaveAttribute("src", defaultPin.imageURL);

  const title = screen.getByRole("heading", { level: 1 });
  expect(title).toHaveTextContent(defaultPin.title);

  screen.getByText(defaultPin.description);

  screen.getByTestId("pin-author-details");

  const authorProfilePicture = screen.getByAltText(
    "Profile picture of John Doe",
  );
  expect(authorProfilePicture.getAttribute("src")).toBe(defaultPin.author.profilePictureURL);

  screen.getByText(defaultPin.author.displayName);
});

it("renders fallback image 'alt' when title is empty", () => {
  const pinWithoutTitle = {
    ...defaultPin,
    title: null,
  };

  renderComponent({ pin: pinWithoutTitle });

  screen.getByAltText(
    `${en.ALT_PIN_BY} ${defaultPin.author.displayName}`,
  );
});
