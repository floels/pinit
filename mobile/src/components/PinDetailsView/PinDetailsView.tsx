import {
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles, { SIDE_PADDING } from "./PinDetailsView.styles";
import BlinkingDots from "../BlinkingDots/BlinkingDots";

import { PinWithAuthorDetails, PinWithFullDetails } from "@/src/lib/types";

type PinDetailsViewProps = {
  pin: PinWithAuthorDetails | PinWithFullDetails;
  pinImageAspectRatio: number;
  isLoading: boolean;
  handlePressBack: () => void;
  handlePressAuthor: () => void;
};

const PinDetailsView = ({
  pin,
  pinImageAspectRatio,
  isLoading,
  handlePressBack,
  handlePressAuthor,
}: PinDetailsViewProps) => {
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth - 2 * SIDE_PADDING;
  const pinImageHeight = imageWidth / pinImageAspectRatio;

  const BackButton = () => (
    <TouchableOpacity
      style={styles.backButton}
      onPress={handlePressBack}
      testID="pin-details-view-back-button"
    >
      <FontAwesome5Icon
        name="chevron-left"
        size={20}
        style={styles.backButtonIcon}
      />
    </TouchableOpacity>
  );

  let displayDescription;

  if ("description" in pin && pin.description) {
    displayDescription = (
      <Text style={styles.pinDescription}>{pin.description}</Text>
    );
  } else if (isLoading) {
    displayDescription = <BlinkingDots style={styles.pinDescription} />;
  }

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Image
          source={{ uri: pin.imageURL }}
          style={[
            styles.pinImage,
            { width: imageWidth, height: pinImageHeight },
          ]}
          testID="pin-details-pin-image"
        />
        <View style={styles.pinData}>
          <TouchableOpacity
            onPress={handlePressAuthor}
            style={styles.authorData}
            testID="pin-details-author-data"
          >
            {pin.author.profilePictureURL && (
              <Image
                source={{ uri: pin.author.profilePictureURL }}
                style={styles.authorProfilePictureImage}
                testID="pin-details-author-profile-picture"
              />
            )}
            <Text style={styles.authorName}>{pin.author.displayName}</Text>
          </TouchableOpacity>
          <Text style={styles.pinTitle}>{pin.title}</Text>
          {displayDescription}
        </View>
      </View>
    </ScrollView>
  );
};

export default PinDetailsView;
