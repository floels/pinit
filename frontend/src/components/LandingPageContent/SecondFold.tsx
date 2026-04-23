import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import styles from "./SecondFold.module.css";
import TextAndExploreButton from "./TextAndExploreButton";
import { FOLD } from "./LandingPageContent";

const SecondFold = () => {
  const { t } = useTranslation("LandingPageContent");

  const exploreLinkTarget = "/search/pins?q=food";

  const textAndLinkLabels = {
    header: t("SecondFold.HEADER"),
    paragraph: t("SecondFold.PARAGRAPH"),
  };

  return (
    <div className={styles.container} data-testid="landing-page-second-fold">
      <div className={styles.picturesArea}>
        <div className={styles.picturesContainer}>
          <div className={styles.pictureLeftContainer}>
            <img
              src="https://s.pinimg.com/webapp/left-511a9304.png"
              alt={t("SecondFold.CHICKEN_PLATE")}
              className={styles.picture}
            />
          </div>
          <div className={styles.pictureTopRightContainer}>
            <img
              src="https://s.pinimg.com/webapp/topRight-d0230035.png"
              alt={t("SecondFold.CHICKEN_PLATE")}
              className={styles.picture}
            />
          </div>
          <div className={styles.pictureBottomRightContainer}>
            <img
              src="https://s.pinimg.com/webapp/right-88044782.png"
              alt={t("SecondFold.CHICKEN_PLATE")}
              className={styles.picture}
            />
          </div>
          <div className={styles.pictureCenterContainer}>
            <img
              src="https://s.pinimg.com/webapp/center-77497603.png"
              alt={t("SecondFold.CHICKEN_PLATE")}
              className={styles.picture}
            />
          </div>
          <p className={styles.searchBarLink}>
            <FontAwesomeIcon
              icon={faSearch}
              className={styles.searchBarLinkIcon}
            />
            {t("SecondFold.EASY_CHICKEN_DINNER")}
          </p>
        </div>
      </div>
      <div className={styles.textArea}>
        <TextAndExploreButton
          foldNumber={FOLD.SECOND}
          linkTarget={exploreLinkTarget}
          labels={textAndLinkLabels}
        />
      </div>
    </div>
  );
};

export default SecondFold;
