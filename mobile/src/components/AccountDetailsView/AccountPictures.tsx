import {
  View,
  Dimensions,
  Image,
  StyleProp,
  ImageStyle,
  Text,
} from "react-native";

import styles from "./AccountPictures.styles";
import ImageSkeleton from "../ImageSkeleton/ImageSkeleton";

import { Account, AccountWithPublicDetails } from "@/src/lib/types";

type AccountPicturesProps = {
  account: AccountWithPublicDetails | Account;
  isLoading: boolean;
};

const AccountPictures = ({ account, isLoading }: AccountPicturesProps) => {
  const { profilePictureURL } = account;

  const screenWidth = Dimensions.get("window").width;

  let backgroundPicture;
  let displaysOrMightDisplayBackgroundPicture;

  if (
    profilePictureURL &&
    "backgroundPictureURL" in account &&
    account.backgroundPictureURL
  ) {
    displaysOrMightDisplayBackgroundPicture = true;

    backgroundPicture = (
      <Image
        source={{ uri: account.backgroundPictureURL }}
        width={screenWidth}
        style={styles.backgroundPictureImage}
        testID="account-background-picture"
      />
    );
  } else if (profilePictureURL && isLoading) {
    displaysOrMightDisplayBackgroundPicture = true;

    backgroundPicture = (
      <ImageSkeleton
        style={styles.backgroundPictureImage}
        testID="background-picture-skeleton"
      />
    );
  }

  const profilePictureStyle = [
    styles.profilePictureImage,
  ] as StyleProp<ImageStyle>[];

  profilePictureStyle.push(
    displaysOrMightDisplayBackgroundPicture
      ? styles.profilePictureImageWithBackgroundPicture
      : styles.profilePictureImageWithoutBackgroundPicture,
  );

  let profilePicture;

  if (profilePictureURL) {
    profilePicture = (
      <Image
        source={{ uri: profilePictureURL }}
        style={profilePictureStyle}
        testID="account-profile-picture"
      />
    );
  } else if (isLoading) {
    // We might get an initial to display...
    profilePicture = (
      <ImageSkeleton
        style={profilePictureStyle}
        testID="profile-picture-skeleton"
      />
    );
  } else if ("initial" in account && account.initial) {
    profilePicture = (
      <View style={styles.initialContainer}>
        <Text style={styles.initial}>{account.initial}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {backgroundPicture}
      {profilePicture}
    </View>
  );
};

export default AccountPictures;
