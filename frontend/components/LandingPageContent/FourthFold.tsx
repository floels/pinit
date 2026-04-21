import { useTranslation } from "react-i18next";
import styles from "./FourthFold.module.css";
import TextAndExploreButton from "./TextAndExploreButton";
import { FOLD } from "./LandingPageContent";

const FourthFold = () => {
  const { t } = useTranslation("LandingPageContent");

  const exploreLinkTarget = "/search/pins?q=make%20up";

  const textAndLinkLabels = {
    header: t("FourthFold.HEADER"),
    paragraph: t("FourthFold.PARAGRAPH"),
  };

  return (
    <div className={styles.container} data-testid="landing-page-fourth-fold">
      <div className={styles.picturesArea}>
        <img
          src="https://s.pinimg.com/webapp/shop-bd0c8a04.png"
          alt={t("FourthFold.LIP_SHADE_PICTURE_ALT")}
          className={styles.coverPicture}
        />
        <div className={styles.picturesOverlay}>
          <img
            src="https://s.pinimg.com/webapp/creator-pin-img-491ebb56.png"
            alt={t("FourthFold.EYE_SHADE_PICTURE_ALT")}
            width={216}
            height={384}
            className={styles.secondaryPicture}
          />
          <img
            src="https://s.pinimg.com/webapp/creator-avatar-d7a05622.png"
            alt={t("FourthFold.CREATOR_THUMBNAIL_PICTURE")}
            width={96}
            height={96}
            className={styles.thumbnailPicture}
          />
          <div className={styles.secondaryPictureText}>
            <span className={styles.secondaryPictureTextTitle}>
              {t("FourthFold.SECONDARY_PICTURE_TEXT_TITLE")}
            </span>
            <span>{t("FourthFold.SECONDARY_PICTURE_TEXT_SUBTITLE")}</span>
          </div>
        </div>
      </div>
      <div className={styles.textArea}>
        <TextAndExploreButton
          foldNumber={FOLD.FOURTH}
          linkTarget={exploreLinkTarget}
          labels={textAndLinkLabels}
        />
      </div>
    </div>
  );
};

export default FourthFold;
