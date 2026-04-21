"use client";

import { useHeaderSearchBarContext } from "@/contexts/headerSearchBarContext";
import styles from "./HeaderSearchBarFocusedOverlay.module.css";

const HeaderSearchBarFocusedOverlay = () => {
  const {
    state: { isInputFocused },
  } = useHeaderSearchBarContext();

  return isInputFocused && <div className={styles.overlay} />;
};

export default HeaderSearchBarFocusedOverlay;
