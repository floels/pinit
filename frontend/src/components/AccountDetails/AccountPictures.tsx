import { useTranslation } from "react-i18next";
import { AccountWithPublicDetails } from "@/lib/types/frontendTypes";
import styles from "./AccountPictures.module.css";

type AccountPicturesProps = {
  account: AccountWithPublicDetails;
};

const BACKGROUND_PICTURE_WIDTH_PX = 656;
const BACKGROUND_PICTURE_HEIGHT_PX = 370;

const PROFILE_PICTURE_WIDTH_PX = 120;
const PROFILE_PICTURE_HEIGHT_PX = 120;

const AccountPictures = ({ account }: AccountPicturesProps) => {
  const { displayName, profilePictureURL, backgroundPictureURL, initial } =
    account;

  const { t } = useTranslation("AccountDetails");

  let backgroudPicture;

  if (profilePictureURL && backgroundPictureURL) {
    backgroudPicture = (
      <img
        src={backgroundPictureURL}
        width={BACKGROUND_PICTURE_WIDTH_PX}
        height={BACKGROUND_PICTURE_HEIGHT_PX}
        alt={`${t("ALT_BACKGROUND_PICTURE_OF")} ${displayName}`}
        className={styles.backgroundPicture}
      />
    );
  }

  let profilePicture;

  if (profilePictureURL) {
    const profilePictureStyles = [styles.profilePicture];

    if (backgroundPictureURL) {
      profilePictureStyles.push(styles.profilePictureWithBackgroundPicture);
    }

    profilePicture = (
      <img
        src={profilePictureURL}
        width={PROFILE_PICTURE_WIDTH_PX}
        height={PROFILE_PICTURE_HEIGHT_PX}
        alt={`${t("ALT_PROFILE_PICTURE_OF")} ${displayName}`}
        className={profilePictureStyles.join(" ")}
      />
    );
  } else {
    profilePicture = <span className={styles.initialContainer}>{initial}</span>;
  }

  return (
    <div className={styles.container}>
      {backgroudPicture}
      {profilePicture}
    </div>
  );
};

export default AccountPictures;
