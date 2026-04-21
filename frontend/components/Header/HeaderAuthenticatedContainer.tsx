"use client";

import { useEffect, useState, useRef } from "react";
import HeaderAuthenticated from "./HeaderAuthenticated";
import {
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { useAccountContext } from "@/contexts/accountContext";

const HeaderAuthenticatedContainer = () => {
  const accountOptionsButtonRef = useRef<HTMLButtonElement>(null);

  const [username, setUsername] = useState<string | null>(null);
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(
    null,
  );
  const [isProfileLinkHovered, setIsProfileLinkHovered] = useState(false);
  const [isAccountOptionsButtonHovered, setIsAccountOptionsButtonHovered] =
    useState(false);
  const [isAccountOptionsFlyoutOpen, setIsAccountOptionsFlyoutOpen] =
    useState(false);

  const accountContext = useAccountContext();

  const handleMouseEnterProfileLink = () => {
    setIsProfileLinkHovered(true);
  };

  const handleMouseLeaveProfileLink = () => {
    setIsProfileLinkHovered(false);
  };

  const handleMouseEnterAccountOptionsButton = () => {
    setIsAccountOptionsButtonHovered(true);
  };

  const handleMouseLeaveAccountOptionsButton = () => {
    setIsAccountOptionsButtonHovered(false);
  };

  const handleClickAccountOptionsButton = () => {
    setIsAccountOptionsFlyoutOpen(!isAccountOptionsFlyoutOpen);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsAccountOptionsFlyoutOpen(false);
    }
  };

  const handleClickOutOfAccountOptionsFlyout = () => {
    setIsAccountOptionsFlyoutOpen(false);
  };

  useEffect(() => {
    if (accountContext.account) {
      const { username, profilePictureURL } = accountContext.account;

      setUsername(username);
      setProfilePictureURL(profilePictureURL);
      return;
    }

    // If the account context has not been fetched yet, fall back to
    // local storage:
    setUsername(localStorage.getItem(USERNAME_LOCAL_STORAGE_KEY));
    setProfilePictureURL(
      localStorage.getItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY),
    );
  }, [accountContext.account]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <HeaderAuthenticated
      username={username}
      profilePictureURL={profilePictureURL}
      isProfileLinkHovered={isProfileLinkHovered}
      isAccountOptionsButtonHovered={isAccountOptionsButtonHovered}
      isAccountOptionsFlyoutOpen={isAccountOptionsFlyoutOpen}
      handleMouseEnterProfileLink={handleMouseEnterProfileLink}
      handleMouseLeaveProfileLink={handleMouseLeaveProfileLink}
      handleClickAccountOptionsButton={handleClickAccountOptionsButton}
      handleMouseEnterAccountOptionsButton={
        handleMouseEnterAccountOptionsButton
      }
      handleMouseLeaveAccountOptionsButton={
        handleMouseLeaveAccountOptionsButton
      }
      handleClickOutOfAccountOptionsFlyout={
        handleClickOutOfAccountOptionsFlyout
      }
      ref={accountOptionsButtonRef}
    />
  );
};

export default HeaderAuthenticatedContainer;
