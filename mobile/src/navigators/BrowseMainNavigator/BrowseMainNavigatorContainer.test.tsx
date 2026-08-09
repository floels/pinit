import { NavigationContainer } from "@react-navigation/native";
import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import BrowseMainNavigatorContainer from "./BrowseMainNavigatorContainer";

import { pressButton } from "@/src/lib/testing-utils/misc";

// For this test suite we mock somewhat clumsily the BrowseMainNavigator component.
// Otherwise, some logic internal to React Navigation triggers state updates not
// wrapped in 'act(...)', which triggers multiple lenghty warnings in the console.
jest.mock(
  "@/src/navigators/BrowseMainNavigator/BrowseMainNavigator.tsx",
  () => {
    const View = jest.requireActual("react-native").View;
    const TouchableOpacity =
      jest.requireActual("react-native").TouchableOpacity;

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

const mockParentNavigation = {
  navigate: jest.fn(),
};

const renderComponent = () => {
  render(
    <NavigationContainer>
      <BrowseMainNavigatorContainer
        parentNavigation={mockParentNavigation as any}
      />
    </NavigationContainer>,
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
