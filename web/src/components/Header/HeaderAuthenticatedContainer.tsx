import { useEffect, useState } from "react";
import HeaderAuthenticated from "./HeaderAuthenticated";
import {
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { useAccountContext } from "@/contexts/accountContext";

const HeaderAuthenticatedContainer = () => {
  const [isAccountOptionsFlyoutOpen, setIsAccountOptionsFlyoutOpen] =
    useState(false);

  const accountContext = useAccountContext();

  const username = accountContext.account
    ? accountContext.account.username
    : localStorage.getItem(USERNAME_LOCAL_STORAGE_KEY);

  const profilePictureURL = accountContext.account
    ? accountContext.account.profilePictureURL
    : localStorage.getItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY);

  const initial = accountContext.account?.initial ?? null;

  const handleClickAccountOptionsButton = () => {
    setIsAccountOptionsFlyoutOpen(!isAccountOptionsFlyoutOpen);
  };

  const handleClickOutOfAccountOptionsFlyout = () => {
    setIsAccountOptionsFlyoutOpen(false);
  };

  // The handler only calls a state setter, which React keeps stable, so it
  // lives inside the effect and the empty dependency array is correct:
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountOptionsFlyoutOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <HeaderAuthenticated
      username={username}
      initial={initial}
      profilePictureURL={profilePictureURL}
      isAccountOptionsFlyoutOpen={isAccountOptionsFlyoutOpen}
      handleClickAccountOptionsButton={handleClickAccountOptionsButton}
      handleClickOutOfAccountOptionsFlyout={
        handleClickOutOfAccountOptionsFlyout
      }
    />
  );
};

export default HeaderAuthenticatedContainer;
