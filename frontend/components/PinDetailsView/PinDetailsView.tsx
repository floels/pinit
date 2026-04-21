import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PinWithFullDetails } from "@/lib/types/frontendTypes";
import styles from "./PinDetailsView.module.css";

type PinDetailsViewProps = {
  pin: PinWithFullDetails;
};

const AUTHOR_PROFILE_PICTURE_SIZE_PX = 48;

const PinDetailsView = ({ pin }: PinDetailsViewProps) => {
  const { t } = useTranslation("PinDetails");

  return (
    <div className={styles.container}>
      <Link to="/">
        <button className={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>
      </Link>
      <div className={styles.pinViewContainer} data-testid="pin-view-container">
        {/* We don't use Next's Image component because we don't know the image's display height in advance. */}
        <img
          src={pin.imageURL}
          alt={
            pin.title
              ? pin.title
              : `${t("ALT_PIN_BY")} ${pin.author.displayName}`
          }
          className={styles.image}
        />
        <div className={styles.pinInformation}>
          <h1 className={styles.pinTitle}>{pin.title}</h1>
          {pin.description && (
            <p className={styles.pinDescription}>{pin.description}</p>
          )}
          <Link
            to={`/${pin.author.username}`}
            className={styles.authorDetails}
            data-testid="pin-author-details"
          >
            {pin.author.profilePictureURL && (
              <img
                className={styles.authorProfilePicture}
                width={AUTHOR_PROFILE_PICTURE_SIZE_PX}
                height={AUTHOR_PROFILE_PICTURE_SIZE_PX}
                src={pin.author.profilePictureURL}
                alt={`${t("ALT_PROFILE_PICTURE_OF")} ${pin.author.displayName}`}
              />
            )}
            <span className={styles.authorName}>{pin.author.displayName}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PinDetailsView;
