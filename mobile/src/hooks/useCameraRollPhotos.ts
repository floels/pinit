import {
  AssetField,
  MediaType,
  Query,
  usePermissions,
} from "expo-media-library";
import { useState, useEffect } from "react";

const NUMBER_CAMERA_ROLL_PHOTOS_FETCHED = 500;

export type CameraRollPhoto = {
  // A "file://" URI resolved from the asset. React Native's <Image> cannot load
  // the raw "ph://" asset URIs, so we resolve each to its on-disk file URI, which
  // also happens to be directly uploadable (no "ph://" upload workaround needed).
  uri: string;
};

export const useCameraRollPhotos = () => {
  const [cameraRollPhotos, setCameraRollPhotos] = useState<CameraRollPhoto[]>(
    [],
  );

  const [refusedCameraRollAccess, setRefusedCameraRollAccess] = useState(false);

  const [
    cameraRollAccessPermissionResponse,
    requestCameraRollAccessPermission,
  ] = usePermissions();

  const getCameraRollPhotos = async () => {
    if (cameraRollAccessPermissionResponse?.accessPrivileges !== "all") {
      const { status } = await requestCameraRollAccessPermission();

      if (status !== "granted") {
        setRefusedCameraRollAccess(true);
        return;
      }
    }

    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
      .limit(NUMBER_CAMERA_ROLL_PHOTOS_FETCHED)
      .exe();

    const photos = await Promise.all(
      assets.map(async (asset) => ({ uri: await asset.getUri() })),
    );

    setCameraRollPhotos(photos);
  };

  useEffect(() => {
    getCameraRollPhotos();
  }, []);

  return { cameraRollPhotos, refusedCameraRollAccess };
};
