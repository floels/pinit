import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import ProfileRouteTabBarIcon from "./ProfileRouteTabBarIcon";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

const mockAsyncStorageGetItem = AsyncStorage.getItem as jest.Mock;

const profilePictureURL = "https://some.domain.com/profile-picture.jpg";

mockAsyncStorageGetItem.mockImplementation(() => profilePictureURL);

const renderComponent = (props?: any) => {
  render(<ProfileRouteTabBarIcon focused={false} color="grey" {...props} />);
};

it("renders profile picture when URL is available in async storage", async () => {
  renderComponent();

  await waitFor(() => {
    const profilePicture = screen.getByTestId("tab-bar-icon-profile-picture");
    expect(profilePicture).toHaveProp("source", { uri: profilePictureURL });
  });
});

it("renders with border when focused", async () => {
  renderComponent({ focused: true });

  await waitFor(() => {
    screen.getByTestId("tab-bar-icon-focused-profile-picture-container");
  });
});

it("renders icon when profile picture URL is not available in async storage", async () => {
  mockAsyncStorageGetItem.mockImplementationOnce(() => null);

  renderComponent();

  screen.getByTestId("tab-bar-icon-user-icon");
});
