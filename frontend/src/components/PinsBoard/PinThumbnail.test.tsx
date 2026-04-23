import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PinThumbnail from "./PinThumbnail";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_ROUTE_PIN_SUGGESTIONS } from "@/lib/constants";

const pin = MOCK_API_RESPONSES_SERIALIZED[API_ROUTE_PIN_SUGGESTIONS].results[0];

const renderComponent = () => {
  render(
    <MemoryRouter>
      <PinThumbnail
        pin={pin}
        isInFirstColumn={false}
        isInLastColumn={false}
        boards={[]}
        isHovered={false}
        indexBoardWhereJustSaved={null}
        isSaveFlyoutOpen={false}
        isSaving={false}
        handleMouseEnterImage={() => {}}
        handleMouseLeaveImage={() => {}}
        handleClickSave={() => {}}
        getClickHandlerForBoard={() => () => {}}
        handleClickOutOfSaveFlyout={() => {}}
      />
    </MemoryRouter>,
  );
};

it("renders all required elements", () => {
  renderComponent();

  const pinImage = screen.getByAltText(pin.title);
  expect(pinImage).toHaveAttribute("src", pin.imageURL);

  screen.getByText(pin.title);

  screen.getByTestId("pin-author-details");

  const authorProfilePicture = screen.getByAltText(
    "Profile picture of John Doe",
  );
  expect(authorProfilePicture.getAttribute("src")).toBe(pin.author.profilePictureURL);

  screen.getByText(pin.author.displayName);
});
