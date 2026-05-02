import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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

it("renders the pin image", () => {
  renderComponent();

  const pinImage = screen.getByAltText(pin.title);
  expect(pinImage).toHaveAttribute("src", pin.imageURL);
});
