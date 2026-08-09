import { NavigationContainer } from "@react-navigation/native";
import { render, screen, waitFor } from "@testing-library/react-native";

import CreateNavigator from "./CreateNavigator";

import ToastAnchor from "@/src/components/ToastAnchor/ToastAnchor";
import { AccountContext } from "@/src/contexts/accountContext";
import { API_ENDPOINT_MY_ACCOUNT_DETAILS } from "@/src/lib/constants";
import { pressButton } from "@/src/lib/testing-utils/misc";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/src/lib/testing-utils/mockAPIResponses";
import { AccountWithPrivateDetails } from "@/src/lib/types";
import enTranslations from "@/translations/en.json";

const createdPin = {
  id: "pin-1",
  imageURL: "https://example.com/image.jpg",
  title: "Pin title",
  description: "Pin description",
};

const createdPinImageAspectRatio = 1.5;

// Both screens of the navigator are mocked. This suite covers what
// 'CreateNavigator' does once a pin is created, not the screens themselves.
jest.mock(
  "@/src/navigators/CreateNavigator/SelectPinImageScreenContainer.tsx",
  () => {
    const TouchableOpacity =
      jest.requireActual("react-native").TouchableOpacity;

    return (props: any) => (
      <TouchableOpacity
        testID="mock-go-to-enter-details"
        onPress={() =>
          props.navigation.navigate("EnterPinDetails", {
            selectedImageURI: "file:///image.jpg",
            providedImageAspectRatio: 1.5,
          })
        }
      />
    );
  },
);

jest.mock(
  "@/src/navigators/CreateNavigator/EnterPinDetailsScreenContainer.tsx",
  () => {
    const TouchableOpacity =
      jest.requireActual("react-native").TouchableOpacity;

    return (props: any) => (
      <TouchableOpacity
        testID="mock-submit-pin"
        onPress={() =>
          props.handleCreateSuccess({
            createdPin,
            createdPinImageAspectRatio,
          })
        }
      />
    );
  },
);

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const account = MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_MY_ACCOUNT_DETAILS];

const renderComponent = ({
  account: accountInContext = account,
}: { account?: AccountWithPrivateDetails | null } = {}) => {
  render(
    <AccountContext.Provider
      value={{ account: accountInContext, setAccount: () => {} }}
    >
      <NavigationContainer>
        <CreateNavigator navigation={mockNavigation as any} />
      </NavigationContainer>
      <ToastAnchor />
    </AccountContext.Provider>,
  );
};

// Walks the navigator from the image selection screen to a successful creation.
const createPin = async () => {
  pressButton({ testID: "mock-go-to-enter-details" });

  await waitFor(() => {
    screen.getByTestId("mock-submit-pin");
  });

  pressButton({ testID: "mock-submit-pin" });
};

beforeEach(() => {
  jest.clearAllMocks();
});

it("navigates back to Browse and shows the success toast upon creation", async () => {
  renderComponent();

  await createPin();

  expect(mockNavigation.navigate).toHaveBeenCalledWith("Authenticated.Browse");

  await waitFor(() => {
    screen.getByText(enTranslations.CreatePin.CREATION_SUCCESS_MESSAGE);
  });
});

it("opens the created pin when the 'View' button of the toast is pressed", async () => {
  renderComponent();

  await createPin();

  await waitFor(() => {
    screen.getByTestId("pin-creation-success-toast-view-button");
  });

  pressButton({ testID: "pin-creation-success-toast-view-button" });

  expect(mockNavigation.navigate).toHaveBeenLastCalledWith(
    "Authenticated.Browse",
    {
      screen: "Authenticated.Browse.CreatedPin",
      params: {
        pin: { ...createdPin, author: account },
        pinImageAspectRatio: createdPinImageAspectRatio,
      },
    },
  );
});

it(`shows the success toast without the 'View' button
when the account has not loaded yet`, async () => {
  renderComponent({ account: null });

  await createPin();

  await waitFor(() => {
    screen.getByText(enTranslations.CreatePin.CREATION_SUCCESS_MESSAGE);
  });

  expect(
    screen.queryByTestId("pin-creation-success-toast-view-button"),
  ).toBeNull();
});
