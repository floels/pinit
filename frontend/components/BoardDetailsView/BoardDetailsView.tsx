import { BoardWithFullDetails } from "@/lib/types/frontendTypes";
import { useTranslation } from "react-i18next";
import styles from "./BoardDetailsView.module.css";
import PinThumbnailsGrid from "../PinThumbnailsGrid/PinThumbnailsGrid";

const AUTHOR_PROFILE_PICTURE_HEIGHT_PX = 48;
const AUTHOR_PROFILE_PICTURE_WIDTH_PX = 48;

const BoardDetailsView = ({ board }: { board: BoardWithFullDetails }) => {
  const { t } = useTranslation("BoardDetails");

  const { name, author, pins } = board;

  const numberOfPins = pins.length;

  const {
    profilePictureURL: authorProfilePictureURL,
    initial: authorInitial,
    displayName: authorDisplayName,
  } = author;

  let displayAuthorProfilePicture;

  if (authorProfilePictureURL) {
    displayAuthorProfilePicture = (
      <img
        src={authorProfilePictureURL}
        alt={`${t("AUTHOR_PROFILE_PICTURE_ALT")} ${authorDisplayName}`}
        height={AUTHOR_PROFILE_PICTURE_HEIGHT_PX}
        width={AUTHOR_PROFILE_PICTURE_WIDTH_PX}
        className={styles.authorProfilePicture}
        data-testid="board-author-profile-picture"
      />
    );
  } else {
    displayAuthorProfilePicture = <div>{authorInitial}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.name}>{name}</h1>
      {displayAuthorProfilePicture}
      <div className={styles.pins}>
        <div className={styles.pinsHeader}>
          {numberOfPins} {t("PINS")}
        </div>
        <PinThumbnailsGrid pins={pins} />
      </div>
    </div>
  );
};

export default BoardDetailsView;
