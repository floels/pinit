import styles from "./PictureSliderPicture.module.css";
import { PICTURE_SLIDER_TOPICS } from "./PictureSliderPictures";

const DURATION_TRANSITION_OUT_IMAGES_MS = 1500;
export const IMAGE_FADE_LAG_MS = 100;

export const IMAGE_URLS = {
  FOOD: [
    "236x/e3/41/4b/e3414b2fcf00375a199ba6964be551af.jpg",
    "236x/78/6e/00/786e00eab219eca59803d118fbe0feb3.jpg",
    "236x/3b/42/b0/3b42b02bf047097582b26401df90cdb3.jpg",
    "236x/de/13/6b/de136b0fa0037d3453a430895d8a5c27.jpg",
    "236x/15/bf/41/15bf41a80a0ffb41cc9d0fd98abed34b.jpg",
    "236x/c4/57/bd/c457bd9496170bfa3845b7cee775df65.jpg",
    "236x/05/65/20/05652045e57af33599557db9f23188c0.jpg",
    "236x/c5/83/53/c58353e15f32f3cbfc7cdcbcf0dc2f34--mango-coulis-m-sorry.jpg",
    "564x/94/43/b9/9443b93bd8773fec91bc1837e8424e8e.jpg",
    "564x/e6/8a/42/e68a42c2e530fbdf6b3ab2f379dcd384.jpg",
    "236x/95/f3/73/95f373590dad79bcf3202ce6edad5bcd.jpg",
    "236x/e7/c6/c6/e7c6c65c6e38f43d4b979d3cb1e46bf7.jpg",
    "236x/fb/18/de/fb18deb4959e9a0678e1bf99105ea775.jpg",
  ],
  HOME: [
    "236x/28/85/8c/28858cedb11e772b00edd867009c5e88.jpg",
    "236x/42/57/16/4257161f841b16b62c3aa92d881a9e8d.jpg",
    "236x/f4/8e/ca/f48eca8c68ffb9e72ab74627c3597ce9--best-bathrooms-small-bathrooms.jpg",
    "564x/3f/47/95/3f479578058904cca0a0e8d693045459.jpg",
    "564x/6f/25/cc/6f25cc5393793930bf9b7106f55c89cf.jpg",
    "236x/a4/7c/6e/a47c6eff8a1b1d5e92f8985cb6aed67d.jpg",
    "236x/ae/91/ab/ae91abd87cc085d894a44f6b34c8129c.jpg",
    "236x/d2/d4/12/d2d41273edca79dae8db151aa28f77d5--blue-grey-bathrooms-tile-bathrooms.jpg",
    "564x/e3/43/12/e34312fc1c469f1e4847282160eabe18.jpg",
    "564x/b9/9b/ac/b99bacfed714e9fafd218c503bf2f300.jpg",
    "236x/c3/5f/ca/c35fcaff9941bce718cf9f4de3f33f57.jpg",
    "236x/f0/da/94/f0da949d68d13c22fc2082eb33f77b0f.jpg",
    "236x/62/6c/70/626c70231c0ef5f21a54737a928c65b0.jpg",
  ],
  OUTFIT: [
    "236x/7a/e3/37/7ae3370edba908ba0df9469d5d6133b0.jpg",
    "236x/d2/3f/c8/d23fc8dd63c85874f8e12fd79c9662e1.jpg",
    "236x/a1/10/e1/a110e1bc0897daf7fb10ee75c0d25639.jpg",
    "564x/86/8e/56/868e5698a3cd46d753459ff448ab6c16.jpg",
    "550x/81/30/fc/8130fcdd4cac0a958df25b4a71a96f35.jpg",
    "236x/b8/ac/51/b8ac51e8e5d9de70114f431574907072.jpg",
    "236x/7c/4f/39/7c4f3961236c4914b25a7ec06f8e08e2.jpg",
    "236x/3d/40/c9/3d40c99ac6cbb6cd441a1b5fb20cd459.jpg",
    "564x/c7/84/cf/c784cfe161c81737cdf2b0f1cfd892cd.jpg",
    "564x/b9/54/9f/b9549f80f3a7dbc5a11a4851c1c076b7.jpg",
    "550x/47/92/b7/4792b7bdc6bb8d59304f23d7ac6d109a.jpg",
    "236x/92/42/6d/92426d84cd455d958db778d54a94fd00.jpg",
    "236x/28/cc/1f/28cc1f5464d7ba55a56e05ee85707dbc.jpg",
  ],
  GARDENING: [
    "236x/d3/fb/69/d3fb6973cddc1d875dc7c2e04525d2e7.jpg",
    "236x/01/84/ca/0184cafdc51049a7d1cc9df88e87db18.jpg",
    "236x/82/78/85/8278857ebd0192658d565a968a7df1cc.jpg",
    "564x/c6/40/4d/c6404d3c1ed97ca0360e0cb634fef9ac.jpg",
    "564x/22/ab/69/22ab69682a7e4b2915e747b711bcc4fc.jpg",
    "550x/a7/87/20/a78720c39a39ac50a2856420d636d113.jpg",
    "236x/51/97/90/5197905f29a3bf796150506e12cb234c.jpg",
    "236x/9e/42/22/9e422240981aebcbe435c05c26f4bec3.jpg",
    "564x/fa/85/77/fa857720e454dd729417920b187493e2.jpg",
    "564x/79/97/d8/7997d893274f6359839d6fe72b1892d6.jpg",
    "236x/f1/13/df/f113df475d4566caa0075c6729960fa3.jpg",
    "236x/fa/85/77/fa857720e454dd729417920b187493e2.jpg",
    "236x/52/a3/d1/52a3d167e25b31783c49d629294a3c35.jpg",
  ],
};

type PictureSliderPictureProps = {
  topicIndex: number;
  imageIndex: number;
  currentStep: number;
  previousStep: number | null;
  timeSinceLastStepChange: number;
};

const computeImageClasses = ({
  topicIndex,
  currentStep,
  previousStep,
  laggedTimeSinceLastStepChange,
}: {
  topicIndex: number;
  currentStep: number;
  previousStep: number | null;
  laggedTimeSinceLastStepChange: number;
}) => {
  const topicIsActive = topicIndex === currentStep - 1; // '-1' because
  // 'topicIndex' is zero-based, while 'currentStep' is one-based
  const topicWasJustActive = previousStep && topicIndex === previousStep - 1;

  if (topicIsActive && laggedTimeSinceLastStepChange > 0) {
    return `${styles.image} ${styles.imageVisible} ${styles.imageCenterPosition}`;
  }

  if (topicWasJustActive && laggedTimeSinceLastStepChange < 0) {
    return `${styles.image} ${styles.imageVisible} ${styles.imageCenterPosition}`;
  }

  if (
    topicWasJustActive &&
    laggedTimeSinceLastStepChange < DURATION_TRANSITION_OUT_IMAGES_MS
  ) {
    // Topic was just active, lag is elapsed but not the transition => send to top
    return `${styles.image} ${styles.imageTopPosition}`;
  }

  return styles.image; // default case (where image is invisible and translated to its bottom position, see CSS file)
};

const PictureSliderPicture = ({
  topicIndex,
  imageIndex,
  currentStep,
  previousStep,
  timeSinceLastStepChange,
}: PictureSliderPictureProps) => {
  // We introduce a lag on the 'timeSinceLastStepChange', which
  // depends on the 'imageIndex'. This is to create the visual effect
  // whereby pictures fade out in a cascading fashion.
  const laggedTimeSinceLastStepChange =
    timeSinceLastStepChange - imageIndex * IMAGE_FADE_LAG_MS;

  const imageClasses = computeImageClasses({
    topicIndex,
    currentStep,
    previousStep,
    laggedTimeSinceLastStepChange,
  });

  const topicLabel = PICTURE_SLIDER_TOPICS[topicIndex];
  const imageURL = `https://i.pinimg.com/${IMAGE_URLS[topicLabel][imageIndex]}`;

  return (
    <div className={styles.container}>
      <img
        src={imageURL}
        alt={topicLabel.toLowerCase()}
        className={imageClasses}
        data-testid={`picture-slider-picture-${topicLabel.toLowerCase()}-${imageIndex}`}
      />
    </div>
  );
};

export default PictureSliderPicture;
