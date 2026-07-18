import { NavigationContainer } from "@react-navigation/native";
import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import BrowseMainNavigatorContainer from "./BrowseMainNavigatorContainer";

import ToastAnchor from "@/src/components/ToastAnchor/ToastAnchor";
import { AccountContext } from "@/src/contexts/accountContext";
import { API_ENDPOINT_MY_ACCOUNT_DETAILS } from "@/src/lib/constants";
import { pressButton } from "@/src/lib/testing-utils/misc";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/src/lib/testing-utils/mockAPIResponses";

// For this test suite we mock somewhat clumsily the BrowseMainNavigator component.
// Otherwise, some logic internal to React Navigation triggers state updates not
// wrapped in 'act(...)', which triggers multiple lenghty warnings in the console.
jest.mock(
  "@/src/navigators/BrowseMainNavigator/BrowseMainNavigator.tsx",
  () => {
    const View = jest.requireActual(
      "react-native/Libraries/Components/View/View",
    );
    const TouchableOpacity = jest.requireActual(
      "react-native/Libraries/Components/Touchable/TouchableOpacity",
    );

    return (props: any) => (
      <View>
        <TouchableOpacity
          testID="mock-create-tab-bar-item"
          onPress={props.createTabPressListener}
        />
        {props.isCreateSelectModalVisible && (
          <View testID="mock-create-select-modal" />
        )}
      </View>
    );
  },
);

const mockNavigation = {
  navigate: jest.fn(),
};

const account = MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_MY_ACCOUNT_DETAILS];

const renderComponent = (props?: any) => {
  render(
    <>
      <AccountContext.Provider value={{ account, setAccount: () => {} }}>
        <NavigationContainer>
          <BrowseMainNavigatorContainer
            navigation={mockNavigation as any}
            {...props}
          />
        </NavigationContainer>
        <ToastAnchor />
      </AccountContext.Provider>
    </>,
  );
};

it("opens the 'Create Select' modal when the 'Create' tab bar icon is tapped", async () => {
  renderComponent();

  expect(screen.queryByTestId("mock-create-select-modal")).toBeNull();

  pressButton({ testID: "mock-create-tab-bar-item" });

  await waitFor(() => {
    screen.getByTestId("mock-create-select-modal");
  });
});

it(`shows pin creation success toast when corresponding props are provided,
and clicking on 'View' link in toast navigates to relevant screen with relevant parameters`, async () => {
  const props = {
    createdPin: {
      imageURL: "https://example.com/image.jpg",
      title: "Pin title",
      description: "Pin description",
    },
    createdPinImageAspectRatio: 1.5,
  };

  renderComponent(props);

  pressButton({ testID: "pin-creation-success-toast-view-button" });

  expect(mockNavigation.navigate).toHaveBeenLastCalledWith(
    "Authenticated.Browse.CreatedPin",
    {
      pin: {
        ...props.createdPin,
        author: account,
      },
      pinImageAspectRatio: 1.5,
    },
  );
});
