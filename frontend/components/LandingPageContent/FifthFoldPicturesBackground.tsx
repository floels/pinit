import { useTranslation } from "react-i18next";
import styles from "./FifthFoldPicturesBackground.module.css";

export const PICTURE_URLS = [
  "https://i.pinimg.com/236x/e3/41/4b/e3414b2fcf00375a199ba6964be551af.jpg",
  "https://i.pinimg.com/236x/78/6e/00/786e00eab219eca59803d118fbe0feb3.jpg",
  "https://i.pinimg.com/236x/3b/42/b0/3b42b02bf047097582b26401df90cdb3.jpg",
  "https://i.pinimg.com/236x/c4/57/bd/c457bd9496170bfa3845b7cee775df65.jpg",
  "https://i.pinimg.com/236x/05/65/20/05652045e57af33599557db9f23188c0.jpg",
  "https://i.pinimg.com/236x/c5/83/53/c58353e15f32f3cbfc7cdcbcf0dc2f34--mango-coulis-m-sorry.jpg",
  "https://i.pinimg.com/236x/95/f3/73/95f373590dad79bcf3202ce6edad5bcd.jpg",
  "https://i.pinimg.com/236x/e7/c6/c6/e7c6c65c6e38f43d4b979d3cb1e46bf7.jpg",
  "https://i.pinimg.com/236x/fb/18/de/fb18deb4959e9a0678e1bf99105ea775.jpg",
  "https://i.pinimg.com/564x/c5/61/c2/c561c2a77d5b9b03702efc423b18cb9a.jpg",
  "https://i.pinimg.com/236x/62/bb/97/62bb9727b2e09751d43c32589c503b39.jpg",
  "https://i.pinimg.com/564x/a9/f9/09/a9f90926afdfbff79f6d2a017c8e19dd.jpg",
  "https://i.pinimg.com/564x/96/2c/ce/962cce1d513d665ecca6eb733a90a160.jpg",
  "https://i.pinimg.com/236x/d5/5f/97/d55f97078c0d7b60b758cac3b34114c9.jpg",
  "https://i.pinimg.com/236x/22/45/e2/2245e261944f1eae080423f6ff7805e1--romantic-picnics-romantic-ideas.jpg",
  "https://i.pinimg.com/236x/65/df/cd/65dfcdd2fc433d45baedb3666cacfd82.jpg",
  "https://i.pinimg.com/564x/28/77/f4/2877f4e254c0bd27ac4f4c5d8a43404f.jpg",
  "https://i.pinimg.com/236x/48/9c/d9/489cd9ae5fec17977c73677866202d59.jpg",
  "https://i.pinimg.com/236x/14/73/0a/14730af41a58e05384b86b0bacf9d57b.jpg",
  "https://i.pinimg.com/236x/16/36/dd/1636dd650e6289cd0ec4f4f06dea7835--british-recipes-the-great-british-bake-off-recipes.jpg",
  "https://i.pinimg.com/236x/d4/32/cd/d432cdc35cf6cc5c7ec07a5036a87bca.jpg",
  "https://i.pinimg.com/236x/c1/d0/7f/c1d07f45a5c2b121255ba9ec54b9adf7.jpg",
  "https://i.pinimg.com/236x/18/dc/f7/18dcf759aa96740f8d335dc6231a9cf9.jpg",
];

const FifthFoldPicturesBackground = () => {
  const { t } = useTranslation("LandingPageContent");

  const BackgroundPicture = ({ pictureIndex }: { pictureIndex: number }) => {
    return (
      <img
        src={PICTURE_URLS[pictureIndex]}
        width={236}
        height={350}
        alt={t("FifthFold.PICTURE_FOOD_ALT")}
        className={styles.backgroundPicture}
      />
    );
  };

  return (
    <div className={styles.picturesBackground}>
      <div>
        <BackgroundPicture pictureIndex={0} />
        <BackgroundPicture pictureIndex={1} />
        <BackgroundPicture pictureIndex={2} />
      </div>
      <div className={styles.picturesBackgroundSecondColumn}>
        <BackgroundPicture pictureIndex={3} />
        <BackgroundPicture pictureIndex={4} />
        <BackgroundPicture pictureIndex={5} />
      </div>
      <div className={styles.picturesBackgroundThirdColumn}>
        <BackgroundPicture pictureIndex={6} />
        <BackgroundPicture pictureIndex={7} />
        <BackgroundPicture pictureIndex={8} />
        <BackgroundPicture pictureIndex={9} />
      </div>
      <div className={styles.picturesBackgroundFourthColumn}>
        <BackgroundPicture pictureIndex={10} />
        <BackgroundPicture pictureIndex={11} />
        <BackgroundPicture pictureIndex={12} />
      </div>
      <div className={styles.picturesBackgroundFifthColumn}>
        <BackgroundPicture pictureIndex={13} />
        <BackgroundPicture pictureIndex={14} />
        <BackgroundPicture pictureIndex={15} />
        <BackgroundPicture pictureIndex={16} />
      </div>
      <div className={styles.picturesBackgroundSixthColumn}>
        <BackgroundPicture pictureIndex={17} />
        <BackgroundPicture pictureIndex={18} />
        <BackgroundPicture pictureIndex={19} />
      </div>
      <div className={styles.picturesColumn}>
        <BackgroundPicture pictureIndex={20} />
        <BackgroundPicture pictureIndex={21} />
        <BackgroundPicture pictureIndex={22} />
      </div>
    </div>
  );
};

export default FifthFoldPicturesBackground;
