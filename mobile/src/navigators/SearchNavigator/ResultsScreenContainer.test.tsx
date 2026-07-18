import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Image } from "react-native";

import ResultsScreenContainer from "./ResultsScreenContainer";

import { API_BASE_URL, API_ENDPOINT_SEARCH_PINS } from "@/src/lib/constants";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/src/lib/testing-utils/mockAPIResponses";

Image.getSize = jest.fn();

const pinImagesWidth = 100;
const pinImagesAspectRatio = 1.5;

(Image.getSize as jest.Mock).mockImplementation((_, success) => {
  success(pinImagesWidth, pinImagesWidth / pinImagesAspectRatio);
});

const mockNavigation = {
  navigate: jest.fn(),
};

const mockHandlePressBack = jest.fn();

const renderComponent = () => {
  render(
    <ResultsScreenContainer
      navigation={mockNavigation as any}
      route={{ params: { searchTerm: "search" } } as any}
      handlePressBack={mockHandlePressBack}
    />,
  );
};

const endpointWithBaseURL = `${API_BASE_URL}/${API_ENDPOINT_SEARCH_PINS}`;

it(`should set search input value based on initial search term provided,
and search pins accordingly`, async () => {
  renderComponent();

  await waitFor(() => {
    const searchInput = screen.getByTestId("pins-search-input-text-input");
    expect(searchInput.props.value).toEqual("search");
  });

  expect(fetch).toHaveBeenCalledWith(`${endpointWithBaseURL}?q=search&page=1`);
});

it("should navigate to screen with proper params when user taps on a pin", async () => {
  fetchMock.mockOnceIf(
    `${endpointWithBaseURL}?q=search&page=1`,
    MOCK_API_RESPONSES[API_ENDPOINT_SEARCH_PINS],
  );

  renderComponent();

  await waitFor(() => {
    const firstPin = screen.getByText("Pin 1 title");

    fireEvent.press(firstPin);

    expect(mockNavigation.navigate).toHaveBeenLastCalledWith(
      "Authenticated.Browse.Main.Search.Pin",
      {
        pin: MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_SEARCH_PINS].results[0],
        pinImageAspectRatio: pinImagesAspectRatio,
      },
    );
  });
});
