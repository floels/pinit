import { render, screen, waitFor } from "@testing-library/react-native";
import { Image } from "react-native";

import SelectPinImageScreenContainer from "./SelectPinImageScreenContainer";

import { useCameraRollPhotos } from "@/src/hooks/useCameraRollPhotos";
import { pressButton } from "@/src/lib/testing-utils/misc";
import enTranslations from "@/translations/en.json";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useFocusEffect: jest.fn(),
}));

jest.mock("@/src/hooks/useCameraRollPhotos", () => ({
  useCameraRollPhotos: jest.fn(),
}));

const selectedPhotoWidth = 100;
const selectedPhotoAspectRatio = 1.5;

// jest.mock("react-native/Libraries/Image/Image", () => ({
//   ...jest.requireActual("react-native/Libraries/Image/Image"),
//   getSize: (_: any, success: any) => {
//     success(selectedPhotoWidth, selectedPhotoWidth / selectedPhotoAspectRatio);
//   },
// }));

const mockUseCameraRollPhotos = useCameraRollPhotos as jest.Mock;

mockUseCameraRollPhotos.mockImplementation(() => ({
  cameraRollPhotos,
  refusedCameraRollAccess: false,
}));

const mockNavigation = {
  navigate: jest.fn(),
} as any;

const mockHandlePressClose = jest.fn();

const cameraRollPhotos = [{ uri: "test-uri-1" }, { uri: "test-uri-2" }];

const renderComponent = () => {
  render(
    <SelectPinImageScreenContainer
      handlePressClose={mockHandlePressClose}
      navigation={mockNavigation}
    />,
  );
};

it("calls 'handlePressClose' when user presses the close button", async () => {
  renderComponent();

  pressButton({ testID: "select-pin-image-screen-close-button" });

  expect(mockHandlePressClose).toHaveBeenCalledTimes(1);
});

it("displays camera roll photos if camera roll access is granted", async () => {
  renderComponent();

  await waitFor(() => {
    const image1 = screen.getByTestId("camera-roll-image-0");
    expect(image1).toHaveProp("source", cameraRollPhotos[0]);

    const image2 = screen.getByTestId("camera-roll-image-1");
    expect(image2).toHaveProp("source", cameraRollPhotos[1]);
  });
});

it("displays the error message if camera roll access is refused", async () => {
  mockUseCameraRollPhotos.mockImplementationOnce(() => ({
    cameraRollPhotos: [],
    refusedCameraRollAccess: true,
  }));

  renderComponent();

  screen.getByText(enTranslations.CreatePin.CAMERA_ROLL_ACCESS_REQUIRED);
});

it("only displays 'Next' button when an image is selected", async () => {
  renderComponent();

  expect(
    screen.queryByTestId("select-pin-image-screen-next-button"),
  ).toBeNull();

  pressButton({ testID: "camera-roll-image-0" });

  screen.getByTestId("select-pin-image-screen-next-button");

  pressButton({ testID: "camera-roll-image-0" });

  expect(
    screen.queryByTestId("select-pin-image-screen-next-button"),
  ).toBeNull();
});

it(`calls 'navigate' with proper arguments when user presses 'Next' button
after selecting an image`, async () => {
  Image.getSize = jest.fn().mockImplementationOnce((_: any, success: any) => {
    success(selectedPhotoWidth, selectedPhotoWidth / selectedPhotoAspectRatio);
  });

  renderComponent();

  pressButton({ testID: "camera-roll-image-0" });

  pressButton({ testID: "camera-roll-image-1" });

  pressButton({ testID: "select-pin-image-screen-next-button" });

  expect(mockNavigation.navigate).toHaveBeenLastCalledWith("EnterPinDetails", {
    selectedImageURI: cameraRollPhotos[1].uri,
    providedImageAspectRatio: selectedPhotoAspectRatio,
  });
});
