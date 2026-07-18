import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Image } from "react-native";

import BaseScreen from "./BaseScreen";

import {
  API_BASE_URL,
  API_ENDPOINT_PIN_SUGGESTIONS,
} from "@/src/lib/constants";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/src/lib/testing-utils/mockAPIResponses";

jest.mock("expo-secure-store", () => ({
  getItemAsync: () => "access_token",
})); // needed to be able to fetch with authentication

Image.getSize = jest.fn();

const pinImagesWidth = 100;
const pinImagesAspectRatio = 1.5;

(Image.getSize as jest.Mock).mockImplementation((_, success) => {
  success(pinImagesWidth, pinImagesWidth / pinImagesAspectRatio);
});

const mockNavigation = {
  navigate: jest.fn(),
};

const renderComponent = () => {
  render(<BaseScreen navigation={mockNavigation as any} />);
};

const endpointWithBaseURL = `${API_BASE_URL}/${API_ENDPOINT_PIN_SUGGESTIONS}`;

it("should navigate to screen with proper params when user taps on a pin", async () => {
  fetchMock.mockOnceIf(
    `${endpointWithBaseURL}?page=1`,
    MOCK_API_RESPONSES[API_ENDPOINT_PIN_SUGGESTIONS],
  );

  renderComponent();

  await waitFor(() => {
    screen.getByText("Pin 1 title");
  });

  const firstPin = screen.getByText("Pin 1 title");

  fireEvent.press(firstPin);

  expect(mockNavigation.navigate).toHaveBeenLastCalledWith(
    "Authenticated.Browse.Main.Home.Pin",
    {
      pin: MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_PIN_SUGGESTIONS]
        .results[0],
      pinImageAspectRatio: pinImagesAspectRatio,
    },
  );
});
