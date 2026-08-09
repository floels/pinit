import React, { useEffect, useEffectEvent, useRef, useState } from "react";
import AccountOptionsFlyout from "./AccountOptionsFlyout";
import { useAccountContext } from "@/contexts/accountContext";
import { useLogOut } from "@/lib/hooks/useLogOut";
import FullPageLoadingOverlay from "@/components/Spinners/FullPageLoadingOverlay";

type AccountOptionsFlyoutContainerProps = {
  handleClickOutOfAccountOptionsFlyout: () => void;
  openerRef: React.RefObject<HTMLButtonElement | null>;
};

const AccountOptionsFlyoutContainer = ({
  handleClickOutOfAccountOptionsFlyout,
  openerRef,
}: AccountOptionsFlyoutContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { account } = useAccountContext();
  const logOut = useLogOut();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClickLogOut = async () => {
    setIsLoggingOut(true);
    await logOut();
  };

  // 'useEffectEvent' so that the listener always calls the current
  // 'handleClickOutOfAccountOptionsFlyout', while the effect below
  // subscribes only once:
  const onClickDocument = useEffectEvent((target: Node) => {
    const userClickedOut =
      !ref.current?.contains(target) && !openerRef.current?.contains(target);

    if (userClickedOut) {
      handleClickOutOfAccountOptionsFlyout();
    }
  });

  useEffect(() => {
    const handleClickDocument = (event: MouseEvent) => {
      onClickDocument(event.target as Node);
    };

    document.addEventListener("click", handleClickDocument);

    return () => {
      document.removeEventListener("click", handleClickDocument);
    };
  }, []);

  if (!account) {
    return null;
  }

  return (
    <>
      {isLoggingOut && <FullPageLoadingOverlay />}
      <AccountOptionsFlyout
        ref={ref}
        displayName={account.displayName}
        initial={account.initial}
        profilePictureURL={account.profilePictureURL}
        accountType={account.type}
        ownerEmail={account.ownerEmail}
        handleClickLogOut={handleClickLogOut}
      />
    </>
  );
};

export default AccountOptionsFlyoutContainer;
