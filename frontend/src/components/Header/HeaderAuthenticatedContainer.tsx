import { useEffect, useState, MouseEvent } from "react";
import HeaderAuthenticated from "./HeaderAuthenticated";
import {
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { useAccountContext } from "@/contexts/accountContext";

const HeaderAuthenticatedContainer = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(
    null,
  );
  const [isAccountOptionsFlyoutOpen, setIsAccountOptionsFlyoutOpen] =
    useState(false);

  const accountContext = useAccountContext();

  // stopPropagation prevents the click from bubbling to the document-level listener
  // registered by AccountOptionsFlyoutContainer, which would immediately close the
  // flyout we just opened (React 18 flushes effects synchronously for trusted clicks).
  const handleClickAccountOptionsButton = (
    e: MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
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
      isAccountOptionsFlyoutOpen={isAccountOptionsFlyoutOpen}
      handleClickAccountOptionsButton={handleClickAccountOptionsButton}
      handleClickOutOfAccountOptionsFlyout={
        handleClickOutOfAccountOptionsFlyout
      }
    />
  );
};

export default HeaderAuthenticatedContainer;
