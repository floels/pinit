import { LinearGradient } from "expo-linear-gradient";

import styles from "./LandingScreenGradient.styles";

const LandingScreenGradient = () => {
  return (
    <LinearGradient
      colors={["rgba(255, 255, 255, 0)", "rgb(255, 255, 255)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    />
  );
};

export default LandingScreenGradient;
