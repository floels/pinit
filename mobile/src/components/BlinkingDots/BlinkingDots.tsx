import { useEffect } from "react";
import {
  Animated,
  StyleProp,
  View,
  ViewStyle,
  useAnimatedValue,
} from "react-native";

import styles from "./BlinkingDots.style";

type BlinkingDotsProps = {
  style?: StyleProp<ViewStyle>;
};

const ANIMATION_DURATION_MS = 200;

const BlinkingDots = ({ style }: BlinkingDotsProps = {}) => {
  const opacityFirstDot = useAnimatedValue(0);
  const opacitySecondDot = useAnimatedValue(0);
  const opacityThirdDot = useAnimatedValue(0);

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacityFirstDot, {
          toValue: 1,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacitySecondDot, {
          toValue: 1,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacityThirdDot, {
          toValue: 1,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacityThirdDot, {
          toValue: 0,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacitySecondDot, {
          toValue: 0,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacityFirstDot, {
          toValue: 0,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start(() => animate()); // Loop the animation
    };

    animate();
  }, [opacityFirstDot, opacitySecondDot, opacityThirdDot]);

  return (
    <View style={[styles.container, style]} testID="blinking-dots">
      <Animated.Text style={{ opacity: opacityFirstDot }}>.</Animated.Text>
      <Animated.Text style={{ opacity: opacitySecondDot }}>.</Animated.Text>
      <Animated.Text style={{ opacity: opacityThirdDot }}>.</Animated.Text>
    </View>
  );
};

export default BlinkingDots;
