import { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, View, ViewStyle } from "react-native";

type SpinnerProps = {
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

const FULL_SPIN_DURATION_MS = 2000;

const Spinner = ({ containerStyle, children }: SpinnerProps) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: FULL_SPIN_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={containerStyle}>
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        {children}
      </Animated.View>
    </View>
  );
};

export default Spinner;
