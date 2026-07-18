import { useEffect, useRef } from "react";
import { View, Animated, Image } from "react-native";

import styles from "./LandingScreenGallery.styles";

// We must have static paths in require(...), so we have to import all images explicitly:
const IMAGE_ASSETS: { [imageKey: string]: number } = {
  "image-0-0": require("@/assets/images/landingScreen/image-0-0.jpg"),
  "image-0-1": require("@/assets/images/landingScreen/image-0-1.jpg"),
  "image-0-2": require("@/assets/images/landingScreen/image-0-2.jpg"),
  "image-0-3": require("@/assets/images/landingScreen/image-0-3.jpg"),
  "image-0-4": require("@/assets/images/landingScreen/image-0-4.jpg"),
  "image-0-5": require("@/assets/images/landingScreen/image-0-5.jpg"),
  "image-0-6": require("@/assets/images/landingScreen/image-0-6.jpg"),
  "image-0-7": require("@/assets/images/landingScreen/image-0-7.jpg"),
  "image-0-8": require("@/assets/images/landingScreen/image-0-8.jpg"),
  "image-0-9": require("@/assets/images/landingScreen/image-0-9.jpg"),
  "image-0-10": require("@/assets/images/landingScreen/image-0-10.jpg"),
  "image-0-11": require("@/assets/images/landingScreen/image-0-11.jpg"),
  "image-0-12": require("@/assets/images/landingScreen/image-0-12.jpg"),
  "image-0-13": require("@/assets/images/landingScreen/image-0-13.jpg"),
  "image-0-14": require("@/assets/images/landingScreen/image-0-14.jpg"),
  "image-0-15": require("@/assets/images/landingScreen/image-0-15.jpg"),
  "image-1-0": require("@/assets/images/landingScreen/image-1-0.jpg"),
  "image-1-1": require("@/assets/images/landingScreen/image-1-1.jpg"),
  "image-1-2": require("@/assets/images/landingScreen/image-1-2.jpg"),
  "image-1-3": require("@/assets/images/landingScreen/image-1-3.jpg"),
  "image-1-4": require("@/assets/images/landingScreen/image-1-4.jpg"),
  "image-1-5": require("@/assets/images/landingScreen/image-1-5.jpg"),
  "image-1-6": require("@/assets/images/landingScreen/image-1-6.jpg"),
  "image-1-7": require("@/assets/images/landingScreen/image-1-7.jpg"),
  "image-1-8": require("@/assets/images/landingScreen/image-1-8.jpg"),
  "image-1-9": require("@/assets/images/landingScreen/image-1-9.jpg"),
  "image-1-10": require("@/assets/images/landingScreen/image-1-10.jpg"),
  "image-1-11": require("@/assets/images/landingScreen/image-1-11.jpg"),
  "image-1-12": require("@/assets/images/landingScreen/image-1-12.jpg"),
  "image-1-13": require("@/assets/images/landingScreen/image-1-13.jpg"),
  "image-1-14": require("@/assets/images/landingScreen/image-1-14.jpg"),
  "image-1-15": require("@/assets/images/landingScreen/image-1-15.jpg"),
  "image-2-0": require("@/assets/images/landingScreen/image-2-0.jpg"),
  "image-2-1": require("@/assets/images/landingScreen/image-2-1.jpg"),
  "image-2-2": require("@/assets/images/landingScreen/image-2-2.jpg"),
  "image-2-3": require("@/assets/images/landingScreen/image-2-3.jpg"),
  "image-2-4": require("@/assets/images/landingScreen/image-2-4.jpg"),
  "image-2-5": require("@/assets/images/landingScreen/image-2-5.jpg"),
  "image-2-6": require("@/assets/images/landingScreen/image-2-6.jpg"),
  "image-2-7": require("@/assets/images/landingScreen/image-2-7.jpg"),
  "image-2-8": require("@/assets/images/landingScreen/image-2-8.jpg"),
  "image-2-9": require("@/assets/images/landingScreen/image-2-9.jpg"),
  "image-2-10": require("@/assets/images/landingScreen/image-2-10.jpg"),
  "image-2-11": require("@/assets/images/landingScreen/image-2-11.jpg"),
  "image-2-12": require("@/assets/images/landingScreen/image-2-12.jpg"),
  "image-2-13": require("@/assets/images/landingScreen/image-2-13.jpg"),
  "image-2-14": require("@/assets/images/landingScreen/image-2-14.jpg"),
  "image-2-15": require("@/assets/images/landingScreen/image-2-15.jpg"),
};

export const NUMBER_IMAGES_PER_COLUMN = 16;
const MAX_SCROLL = 3000;
const SCROLL_DURATION_MS = 2 * 60 * 1000;

const LandingScreenGallery = () => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -MAX_SCROLL,
      duration: SCROLL_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, []);

  const imageIndexes = Array.from(
    { length: NUMBER_IMAGES_PER_COLUMN },
    (_, index) => index,
  );

  const renderImageColumn = ({ columnIndex }: { columnIndex: number }) => (
    <View
      style={styles.imageColumn}
      testID={`landing-screen-gallery-column-${columnIndex}`}
    >
      {imageIndexes.map((_, imageIndex) => {
        const imageKey = `image-${columnIndex}-${imageIndex}`;

        return (
          <Image
            key={imageKey}
            source={IMAGE_ASSETS[imageKey]}
            style={styles.image}
          />
        );
      })}
    </View>
  );

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      {renderImageColumn({ columnIndex: 0 })}
      {renderImageColumn({ columnIndex: 1 })}
      {renderImageColumn({ columnIndex: 2 })}
    </Animated.View>
  );
};

export default LandingScreenGallery;
