import { render, screen, waitFor } from "@testing-library/react-native";

import HomeScreen from "./HomeScreen";

import { API_BASE_URL, API_ENDPOINT_PIN_DETAILS } from "@/src/lib/constants";
import { pressButton, withQueryClient } from "@/src/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/src/lib/testing-utils/mockAPIResponses";

const pinWithFullDetails =
  MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_PIN_DETAILS];

const { description, ...providedPin } = pinWithFullDetails;

const pinImageAspectRatio = 1.5;

const mockNavigation = { goBack: jest.fn() } as any;

const endpointURL = `${API_BASE_URL}/${API_ENDPOINT_PIN_DETAILS}/${providedPin.id}/`;

const renderComponent = () => {
  render(
    withQueryClient(
      <HomeScreen
        pin={providedPin}
        pinImageAspectRatio={pinImageAspectRatio}
        navigation={mockNavigation}
      />,
    ),
  );
};

beforeEach(() => {
  // Since we have animation in the component (blinking dots):
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllTimers();
});

it(`renders provided information and loading state 
for description initially`, () => {
  const eternalPromise = new Promise<Response>(() => {});

  fetchMock.mockImplementationOnce(() => eternalPromise);

  renderComponent();

  const pinImage = screen.getByTestId("pin-details-pin-image");
  expect(pinImage).toHaveProp("source", { uri: providedPin.imageURL });

  const authorProfilePicture = screen.getByTestId(
    "pin-details-author-profile-picture",
  );
  expect(authorProfilePicture).toHaveProp("source", {
    uri: providedPin.author.profilePictureURL,
  });

  screen.getByText(providedPin.author.displayName);
  screen.getByText(providedPin.title);

  screen.getByTestId("blinking-dots");
});

it(`renders description and hides blinking dots
upon successful response`, async () => {
  fetchMock.mockOnceIf(
    endpointURL,
    MOCK_API_RESPONSES[API_ENDPOINT_PIN_DETAILS],
  );

  renderComponent();

  await waitFor(() => {
    screen.getByText(description);

    expect(screen.queryByTestId("blinking-dots")).toBeNull();
  });
});

it("calls 'navigation.goBack' upon pressing back button", () => {
  renderComponent();

  pressButton({ testID: "pin-details-view-back-button" });

  expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
});
