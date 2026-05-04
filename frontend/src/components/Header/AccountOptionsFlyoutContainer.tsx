import React, { useEffect, useRef } from "react";
import AccountOptionsFlyout from "./AccountOptionsFlyout";
import { useAccountContext } from "@/contexts/accountContext";
import { useLogOut } from "@/lib/hooks/useLogOut";

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
      handleClickLogOut={logOut}
    />
  );
};

export default AccountOptionsFlyoutContainer;
