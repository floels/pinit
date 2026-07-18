import { renderHook } from "@testing-library/react-hooks";
import { waitFor } from "@testing-library/react-native";
import * as MediaLibrary from "expo-media-library";

import { useCameraRollPhotos } from "../../src/hooks/useCameraRollPhotos";

const photosInCameraRoll = [{ uri: "test-uri-1" }, { uri: "test-uri-2" }];

jest.mock("expo-media-library", () => ({
  usePermissions: jest.fn(),
  getAssetsAsync: () => ({
    assets: [{ uri: "test-uri-1" }, { uri: "test-uri-2" }],
  }),
}));

const mockUsePermissions = MediaLibrary.usePermissions as jest.Mock;

it("requests camera roll access if permission hasn't yet been granted", async () => {
  const mockRequestCameraRollAccessPermission = jest
    .fn()
    .mockResolvedValue({ status: "granted" });

  mockUsePermissions.mockImplementation(() => [
    { accessPrivileges: "none" },
    mockRequestCameraRollAccessPermission,
  ]);

  renderHook(() => useCameraRollPhotos());

  expect(mockRequestCameraRollAccessPermission).toHaveBeenCalledTimes(1);
});

it("sets 'refusedCameraRollAccess' to 'true' if camera roll access is refused", async () => {
  mockUsePermissions.mockImplementation(() => [
    { accessPrivileges: "none" },
    jest.fn().mockResolvedValue({ status: "denied" }),
  ]);

  const { result } = renderHook(() => useCameraRollPhotos());

  await waitFor(() => {
    expect(result.current.refusedCameraRollAccess).toBe(true);
  });
});

it("sets 'cameraRollPhotos' appropriately when camera roll access is granted", async () => {
  mockUsePermissions.mockImplementation(() => [
    { accessPrivileges: "all" },
    jest.fn().mockResolvedValue({ status: "granted" }),
  ]);

  const { result } = renderHook(() => useCameraRollPhotos());

  await waitFor(() => {
    expect(result.current.cameraRollPhotos).toEqual(photosInCameraRoll);
  });
});
