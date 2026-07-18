import * as MediaLibrary from "expo-media-library";
import { useState, useEffect } from "react";

const NUMBER_CAMERA_ROLL_PHOTOS_FETCHED = 500;

export const useCameraRollPhotos = () => {
  const [cameraRollPhotos, setCameraRollPhotos] = useState<
    MediaLibrary.Asset[]
  >([]);

  const [refusedCameraRollAccess, setRefusedCameraRollAccess] = useState(false);

  const [
    cameraRollAccessPermissionResponse,
    requestCameraRollAccessPermission,
  ] = MediaLibrary.usePermissions();

  const getCameraRollPhotos = async () => {
    if (cameraRollAccessPermissionResponse?.accessPrivileges !== "all") {
      const { status } = await requestCameraRollAccessPermission();

      if (status !== "granted") {
        setRefusedCameraRollAccess(true);
        return;
      }
    }

    const { assets } = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      first: NUMBER_CAMERA_ROLL_PHOTOS_FETCHED,
    });

    setCameraRollPhotos(assets);
  };

  useEffect(() => {
    getCameraRollPhotos();
  }, []);

  return { cameraRollPhotos, refusedCameraRollAccess };
};
