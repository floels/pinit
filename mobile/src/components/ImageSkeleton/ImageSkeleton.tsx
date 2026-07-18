import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  View,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";

import styles from "./ImageSkeleton.styles";

type ImageSkeletonProps = {
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const GLAZE_ANIMATION_DURATION = 2000;

const ImageSkeleton = ({ style, testID }: ImageSkeletonProps) => {
  const [parentWidth, setParentWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setParentWidth(width);
  };

  const animatedValue = new Animated.Value(0);

  Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: GLAZE_ANIMATION_DURATION,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ).start();

  const glazeTranslationX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-0.2 * parentWidth, parentWidth],
  });

  const Glaze = () => (
    <Animated.View
      style={[
        styles.animatedGlaze,
        {
          transform: [{ translateX: glazeTranslationX }],
        },
      ]}
    >
      <LinearGradient
        colors={["#e9e9e9", "rgb(250, 250, 250)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientLeft}
      />
      <LinearGradient
        colors={["rgb(250, 250, 250)", "#e9e9e9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientRight}
      />
    </Animated.View>
  );

  return (
    <View
      onLayout={handleLayout}
      style={[styles.container, style]}
      testID={testID}
    >
      <Glaze />
    </View>
  );
};

export default ImageSkeleton;
