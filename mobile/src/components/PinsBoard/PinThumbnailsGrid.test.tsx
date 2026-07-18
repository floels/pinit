import { render, screen } from "@testing-library/react-native";
import React from "react";

import PinThumbnailsGrid from "./PinThumbnailsGrid";

import { API_ENDPOINT_PIN_SUGGESTIONS } from "@/src/lib/constants";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/src/lib/testing-utils/mockAPIResponses";

const mockPins =
  MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_PIN_SUGGESTIONS].results;

const mockAspectRatios = [1, 1.5, 2];

const mockGetTapHandlerForPin = jest.fn();

it("renders the correct number of pins in each column", () => {
  render(
    <PinThumbnailsGrid
      pins={mockPins}
      pinImageAspectRatios={mockAspectRatios}
      getTapHandlerForPin={mockGetTapHandlerForPin}
    />,
  );

  const firstColumn = screen.getByTestId("thumbnails-column-0");

  expect(firstColumn).toContainElement(screen.getByText("Pin 1 title"));
  expect(firstColumn).toContainElement(screen.getByText("Pin 3 title"));

  const secondColumn = screen.getByTestId("thumbnails-column-1");

  expect(secondColumn).toContainElement(screen.getByText("Pin 2 title"));
});
