import { View, Image, Text } from "react-native";

import styles from "./PinThumbnail.styles";

import { PinWithAuthorDetails } from "@/src/lib/types";
import { ellipsizeText } from "@/src/lib/utils/strings";

type PinThumbnailProps = {
  pin: PinWithAuthorDetails;
  width: number;
  pinImageAspectRatio: number;
};

const MAX_CHARACTERS_TITLE = 80;

const PinThumbnail = ({
  pin,
  width,
  pinImageAspectRatio,
}: PinThumbnailProps) => {
  const { author, title, imageURL } = pin;

  let displayAuthorData;

  if (author.profilePictureURL) {
    displayAuthorData = (
      <View style={styles.authorData}>
        <Image
          source={{ uri: author.profilePictureURL }}
          style={styles.authorProfilePicture}
          testID="pin-thumbnail-author-profile-picture"
        />
        <Text style={styles.authorName}>{author.displayName}</Text>
      </View>
    );
  } else {
    displayAuthorData = (
      <Text style={styles.authorName}>{author.displayName}</Text>
    );
  }

  const pinImageHeight = width / pinImageAspectRatio;

  return (
    <View style={[styles.container, { width }]}>
      <Image
        source={{ uri: imageURL }}
        width={width}
        height={pinImageHeight}
        style={styles.image}
        testID="pin-thumbnail-pin-image"
      />
      <Text style={styles.title}>
        {ellipsizeText({ text: title, maxLength: MAX_CHARACTERS_TITLE })}
      </Text>
      {displayAuthorData}
    </View>
  );
};

export default PinThumbnail;
