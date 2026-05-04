import React, { useEffect, useRef, useState } from "react";
import AccountOptionsFlyout from "./AccountOptionsFlyout";
import { useAccountContext } from "@/contexts/accountContext";
import { useLogOut } from "@/lib/hooks/useLogOut";
import styles from "./AccountOptionsFlyoutContainer.module.css";

type AccountOptionsFlyoutContainerProps = {
  handleClickOutOfAccountOptionsFlyout: () => void;
  openerRef: React.RefObject<HTMLButtonElement | null>;
};

const AccountOptionsFlyoutContainer = ({
  handleClickOutOfAccountOptionsFlyout,
  openerRef,
}: AccountOptionsFlyoutContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [clickedLogOut, setClickedLogOut] = useState(false);

  const { account } = useAccountContext();
  const logOut = useLogOut();

  const handleClickLogOut = () => {
    setClickedLogOut(true);
    logOut();
  };

  const handleClickDocument = (event: MouseEvent) => {
    const target = event.target as Node;

    const userClickedOut =
      !ref.current?.contains(target) && !openerRef.current?.contains(target);

    if (userClickedOut) {
      handleClickOutOfAccountOptionsFlyout();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickDocument);

    return () => {
      document.removeEventListener("click", handleClickDocument);
    };
  }, []);

  if (clickedLogOut) {
    return <div className={styles.loadingOverlay} data-testid="logout-loading-overlay" />;
  }

  if (!account) {
    return null;
  }

  return (
    <AccountOptionsFlyout
      ref={ref}
      displayName={account.displayName}
      initial={account.initial}
      profilePictureURL={account.profilePictureURL}
      accountType={account.type}
      ownerEmail={account.ownerEmail}
      handleClickLogOut={handleClickLogOut}
    />
  );
};

export default AccountOptionsFlyoutContainer;
