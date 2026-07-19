import { renderHook, waitFor } from "@testing-library/react-native";
import { usePermissions } from "expo-media-library";

import { useCameraRollPhotos } from "../../src/hooks/useCameraRollPhotos";

const photosInCameraRoll = [
  { uri: "file:///photo-1.jpg" },
  { uri: "file:///photo-2.jpg" },
];

jest.mock("expo-media-library", () => ({
  AssetField: { MEDIA_TYPE: "mediaType" },
  MediaType: { IMAGE: "image" },
  usePermissions: jest.fn(),
  // The `Query` builder is chainable, so each filtering method returns `this`.
  // `exe` resolves to assets whose `getUri` yields an uploadable "file://" URI.
  Query: jest.fn().mockImplementation(() => ({
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exe: jest
      .fn()
      .mockResolvedValue([
        { getUri: () => Promise.resolve("file:///photo-1.jpg") },
        { getUri: () => Promise.resolve("file:///photo-2.jpg") },
      ]),
  })),
}));

const mockUsePermissions = usePermissions as jest.Mock;

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
