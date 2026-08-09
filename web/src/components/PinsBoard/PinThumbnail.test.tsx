import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import PinThumbnail from "./PinThumbnail";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_PIN_SUGGESTIONS } from "@/lib/constants";

const pin = MOCK_API_RESPONSES_SERIALIZED[API_URL_PIN_SUGGESTIONS].results[0];

const renderComponent = () => {
  render(
    <MemoryRouter>
      <PinThumbnail
        pin={pin}
        isInFirstColumn={false}
        isInLastColumn={false}
        boards={[]}
        isImageHovered={false}
        indexBoardWhereJustSaved={null}
        isSaveFlyoutOpen={false}
        isSaving={false}
        isMoreActionsDropdownOpen={false}
        handleMouseEnterImage={() => {}}
        handleMouseLeaveImage={() => {}}
        handleClickSave={() => {}}
        getClickHandlerForBoard={() => () => {}}
        handleClickOutOfSaveFlyout={() => {}}
        handleClickMoreActions={() => {}}
        handleClickOutOfMoreActionsDropdown={() => {}}
        handleDownloadImage={() => {}}
      />
    </MemoryRouter>,
  );
};

it("renders the pin image", () => {
  renderComponent();

  const pinImage = screen.getByAltText(pin.title);
  expect(pinImage).toHaveAttribute("src", pin.imageURL);
});

it("sets the width and height attributes from the reported dimensions", () => {
  // The attributes give the browser the aspect ratio, so it reserves the box of
  // the image before the image loads and the grid does not shift.
  renderComponent();

  const pinImage = screen.getByAltText(pin.title);

  expect(pinImage).toHaveAttribute("width", String(pin.imageWidth));
  expect(pinImage).toHaveAttribute("height", String(pin.imageHeight));
});

