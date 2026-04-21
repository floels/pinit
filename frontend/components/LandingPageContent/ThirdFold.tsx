import { useTranslation } from "react-i18next";
import TextAndExploreButton from "./TextAndExploreButton";
import styles from "./ThirdFold.module.css";
import { FOLD } from "./LandingPageContent";

const ThirdFold = () => {
  const { t } = useTranslation("LandingPageContent");

  const exploreLinkTarget = "/search/pins?q=home";

  const textAndLinkLabels = {
    header: t("ThirdFold.HEADER"),
    paragraph: t("ThirdFold.PARAGRAPH"),
  };

  return (
    <div className={styles.container} data-testid="landing-page-third-fold">
      <div className={styles.textArea}>
        <TextAndExploreButton
          foldNumber={FOLD.THIRD}
          linkTarget={exploreLinkTarget}
          labels={textAndLinkLabels}
        />
      </div>
      <div className={styles.picturesArea}>
        <div className={styles.picturesContainer}>
          <div className={styles.pictureTopLeftContainer}>
            <img
              src="https://s.pinimg.com/webapp/future-home-vibes-55a673b9.png"
              alt={t("ThirdFold.FUTURE_HOME_VIBES")}
              className={styles.mainPicture}
            />
            <div
              className={`${styles.pictureOverlay} ${styles.topLeftPictureOverlay}`}
            >
              <div
                className={`${styles.pictureOverlayText} ${styles.topLeftPictureOverlayText}`}
              >
                {t("ThirdFold.FUTURE_HOME_VIBES")}
              </div>
              <div className={styles.smallPicturesContainer}>
                <img
                  src="https://s.pinimg.com/webapp/future-home1-f4037b6b.png"
                  alt={t("ThirdFold.FUTURE_HOME_VIBES")}
                  width={90}
                  height={130}
                  className={styles.smallPicture}
                />
                <img
                  src="https://s.pinimg.com/webapp/future-home2-c70a8738.png"
                  alt={t("ThirdFold.FUTURE_HOME_VIBES")}
                  width={90}
                  height={130}
                  className={styles.smallPicture}
                />
                <img
                  src="https://s.pinimg.com/webapp/future-home3-ac09e50f.png"
                  alt={t("ThirdFold.FUTURE_HOME_VIBES")}
                  width={90}
                  height={130}
                  className={styles.smallPicture}
                />
              </div>
            </div>
          </div>
          <div className={styles.pictureTopRightContainer}>
            <img
              src="https://s.pinimg.com/webapp/scandinavian-bedroom-917ad89c.png"
              alt={t("ThirdFold.SCANDINAVIAN_BEDROOM")}
              className={styles.mainPicture}
            />
            <div
              className={`${styles.pictureOverlay} ${styles.topRightPictureOverlay}`}
            >
              <div
                className={`${styles.pictureOverlayText} ${styles.topRightPictureOverlayText}`}
              >
                {t("ThirdFold.SCANDINAVIAN_BEDROOM")}
              </div>
            </div>
          </div>
          <div className={styles.pictureMiddleRightContainer}>
            <img
              src="https://s.pinimg.com/webapp/deck-of-dreams-fb527bf1.png"
              alt={t("ThirdFold.DECK_OF_MY_DREAMS")}
              className={styles.mainPicture}
            />
            <div
              className={`${styles.pictureOverlay} ${styles.middleRightPictureOverlay}`}
            >
              <div
                className={`${styles.pictureOverlayText} ${styles.middleRightPictureOverlayText}`}
              >
                {t("ThirdFold.DECK_OF_MY_DREAMS")}
              </div>
            </div>
          </div>
          <div className={styles.pictureBottomLeftContainer}>
            <img
              src="https://s.pinimg.com/webapp/serve-my-drinks-263547ea.png"
              alt={t("ThirdFold.SERVE_DRINKS")}
              className={styles.mainPicture}
            />
            <div
              className={`${styles.pictureOverlay} ${styles.bottomLeftPictureOverlay}`}
            >
              <div
                className={`${styles.pictureOverlayText} ${styles.bottomLeftPictureOverlayText}`}
              >
                {t("ThirdFold.SERVE_DRINKS")}
              </div>
            </div>
          </div>
          <div className={styles.pictureBottomRightContainer}>
            <img
              src="https://s.pinimg.com/webapp/bathroom-upgrade-48ebb8fc.png"
              alt={t("ThirdFold.BATHROOM_UPGRADE")}
              className={styles.mainPicture}
            />
            <div
              className={`${styles.pictureOverlay} ${styles.bottomRightPictureOverlay}`}
            >
              <div
                className={`${styles.pictureOverlayText} ${styles.bottomRightPictureOverlayText}`}
              >
                {t("ThirdFold.BATHROOM_UPGRADE")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirdFold;
