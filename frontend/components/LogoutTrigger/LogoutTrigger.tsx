"use client";

import { useEffect } from "react";
import styles from "./LogoutTrigger.module.css";
import { useLogOut } from "@/lib/hooks/useLogOut";

const LogoutTrigger = () => {
  const logOut = useLogOut();

  useEffect(() => {
    logOut();
  }, []);

  return (
    <div className={styles.overlay} data-testid="logout-trigger-overlay" />
  );
};

export default LogoutTrigger;
