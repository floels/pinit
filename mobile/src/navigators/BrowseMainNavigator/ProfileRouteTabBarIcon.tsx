import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { Image, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles from "./ProfileRouteTabBarIcon.styles";

import { PROFILE_PICTURE_URL_STORAGE_KEY } from "@/src/lib/constants";

type ProfileRouteTabBarIconProps = {
  focused: boolean;
  color: string;
};

const ProfileRouteTabBarIcon = ({
  focused,
  color,
}: ProfileRouteTabBarIconProps) => {
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(
    null,
  );

  const fetchProfilePictureURL = async () => {
    let fetchedProfilePictureURL;

    try {
      fetchedProfilePictureURL = await AsyncStorage.getItem(
        PROFILE_PICTURE_URL_STORAGE_KEY,
      );
    } catch {
      // Fail silently
    }

    if (fetchedProfilePictureURL) {
      setProfilePictureURL(fetchedProfilePictureURL);
    }
  };

  useEffect(() => {
    fetchProfilePictureURL();
  }, []);

  if (profilePictureURL) {
    const image = (
      <Image
        source={{ uri: profilePictureURL }}
        style={styles.profilePicture}
        testID="tab-bar-icon-profile-picture"
      />
    );

    if (focused) {
      return (
        <View
          style={styles.focusedProfilePictureContainer}
          testID="tab-bar-icon-focused-profile-picture-container"
        >
          {image}
        </View>
      );
    }

    return image;
  }

  return (
    <FontAwesome5Icon
      name="user"
      size={24}
      color={color}
      testID="tab-bar-icon-user-icon"
    />
  );
};

export default ProfileRouteTabBarIcon;
