import PictureSliderPicture from "./PictureSliderPicture";
import styles from "./PictureSliderPictures.module.css";

type PictureSliderPicturesProps = {
  currentStep: number;
  previousStep: number | null;
  timeSinceLastStepChange: number;
};

export enum TopicsType {
  FOOD = "FOOD",
  HOME = "HOME",
  OUTFIT = "OUTFIT",
  GARDENING = "GARDENING",
}

export const PICTURE_SLIDER_TOPICS: TopicsType[] = [
  TopicsType.FOOD,
  TopicsType.HOME,
  TopicsType.OUTFIT,
  TopicsType.GARDENING,
];

const PictureSliderPictures = ({
  currentStep,
  previousStep,
  timeSinceLastStepChange,
}: PictureSliderPicturesProps) => {
  return (
    <div className={styles.container}>
      {PICTURE_SLIDER_TOPICS.map((topic, index) => {
        const commonPictureProps = {
          currentStep,
          previousStep,
          timeSinceLastStepChange,
          topicIndex: index,
        };

        return (
          <div
            key={`pictures-container-${topic.toLowerCase()}`}
            className={styles.topicPicturesContainer}
          >
            <div className={styles.picturesColumn}>
              <PictureSliderPicture {...commonPictureProps} imageIndex={0} />
              <PictureSliderPicture {...commonPictureProps} imageIndex={1} />
            </div>
            <div className={styles.picturesColumn} style={{ paddingTop: 120 }}>
              <PictureSliderPicture {...commonPictureProps} imageIndex={2} />
              <PictureSliderPicture {...commonPictureProps} imageIndex={3} />
            </div>
            <div className={styles.picturesColumn} style={{ paddingTop: 200 }}>
              <PictureSliderPicture {...commonPictureProps} imageIndex={4} />
              <PictureSliderPicture {...commonPictureProps} imageIndex={5} />
            </div>
            <div className={styles.picturesColumn} style={{ paddingTop: 360 }}>
              <PictureSliderPicture {...commonPictureProps} imageIndex={6} />
            </div>
            <div className={styles.picturesColumn} style={{ paddingTop: 200 }}>
              <PictureSliderPicture {...commonPictureProps} imageIndex={7} />
              <PictureSliderPicture {...commonPictureProps} imageIndex={8} />
            </div>
            <div className={styles.picturesColumn} style={{ paddingTop: 120 }}>
              <PictureSliderPicture {...commonPictureProps} imageIndex={9} />
              <PictureSliderPicture {...commonPictureProps} imageIndex={10} />
            </div>
            <div className={styles.picturesColumn}>
              <PictureSliderPicture {...commonPictureProps} imageIndex={11} />
              <PictureSliderPicture {...commonPictureProps} imageIndex={12} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PictureSliderPictures;
