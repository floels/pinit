import _ from "lodash";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import styles from "./PictureSlider.module.css";
import PictureSliderPictures, {
  PICTURE_SLIDER_TOPICS,
  TopicsType,
} from "./PictureSliderPictures";

type PictureSliderProps = {
  onClickSeeBelow: () => void;
};

type PictureSliderState = {
  previousStep: number | null;
  currentStep: number;
  timeSinceLastStepChange: number;
};

export const TIME_BEFORE_AUTOMATIC_STEP_CHANGE_MS = 5000;
const DURATION_TRANSITION_OUT_HEADERS_MS = 1500;
export const TIMER_TIME_STEP_MS = 50;

const computeHeaderClasses = ({
  topic,
  topicIndex,
  currentStep,
  previousStep,
  timeSinceLastStepChange,
}: {
  topic: TopicsType;
  topicIndex: number;
  currentStep: number;
  previousStep: number | null;
  timeSinceLastStepChange: number;
}) => {
  const isHeaderOfCurrentStep = topicIndex === currentStep - 1; // '-1' because
  // 'topicIndex' is zero-based, while 'currentStep' is one-based

  const isHeaderOfPreviousStep =
    previousStep && topicIndex === previousStep - 1;

  const defaultClasses = `${styles.topicHeader} ${
    styles[`topicHeader${_.capitalize(topic)}`]
  }`; // e.g. "topicHeader topicHeaderFood"

  if (isHeaderOfCurrentStep) {
    return `${defaultClasses} ${styles.topicHeaderVisible} ${styles.topicHeaderCenterPosition}`;
  }

  if (
    isHeaderOfPreviousStep &&
    timeSinceLastStepChange < DURATION_TRANSITION_OUT_HEADERS_MS
  ) {
    return `${defaultClasses} ${styles.topicHeaderTopPosition}`;
  }

  return defaultClasses;
};

const computeStepperButtonClasses = ({
  stepperButtonIndex,
  currentStep,
}: {
  stepperButtonIndex: number;
  currentStep: number;
}) => {
  const isStepperButtonOfCurrentStep = stepperButtonIndex === currentStep - 1; // '-1' because
  // 'stepperButtonIndex' is zero-based, while 'currentStep' is one-based

  const correspondingTopic = PICTURE_SLIDER_TOPICS[stepperButtonIndex];

  const defaultClasses = `${styles.stepperButton} ${
    styles[`stepperButton${_.capitalize(correspondingTopic)}`]
  }`; // e.g. "stepperButton stepperButtonFood"

  if (isStepperButtonOfCurrentStep) {
    return `${defaultClasses} ${styles.stepperButtonActive}`;
  }

  return defaultClasses;
};

const computeCarretClasses = ({ currentStep }: { currentStep: number }) => {
  const activeTopic = PICTURE_SLIDER_TOPICS[currentStep - 1];

  return `${styles.carret} ${styles[`carret${_.capitalize(activeTopic)}`]}`;
};

const PictureSlider = ({ onClickSeeBelow }: PictureSliderProps) => {
  const { t } = useTranslation("LandingPageContent");

  const [state, setState] = useState<PictureSliderState>({
    previousStep: null,
    currentStep: 1,
    timeSinceLastStepChange: 0,
  });

  useEffect(() => {
    const timerId = setInterval(() => {
      setState((prevState) => {
        const newTimeSinceLastStepChange =
          prevState.timeSinceLastStepChange + TIMER_TIME_STEP_MS;

        if (
          newTimeSinceLastStepChange >= TIME_BEFORE_AUTOMATIC_STEP_CHANGE_MS
        ) {
          return {
            previousStep: prevState.currentStep,
            currentStep:
              prevState.currentStep === 4 ? 1 : prevState.currentStep + 1,
            timeSinceLastStepChange: 0,
          };
        }

        return {
          ...prevState,
          timeSinceLastStepChange: newTimeSinceLastStepChange,
        };
      });
    }, TIMER_TIME_STEP_MS);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const moveToStep = (newStep: number) => {
    setState((prevState) => ({
      previousStep: prevState.currentStep,
      currentStep: newStep,
      timeSinceLastStepChange: 0,
    }));
  };

  const topicHeaders = PICTURE_SLIDER_TOPICS.map((topic, topicIndex) => {
    const classes = computeHeaderClasses({
      topic,
      topicIndex,
      ...state,
    });

    return (
      <p key={`header-${topic.toLowerCase()}`} className={classes}>
        {t(`PictureSlider.HEADER_${topic}`)}
      </p>
    );
  });

  const stepperButtons = PICTURE_SLIDER_TOPICS.map((_, stepperButtonIndex) => {
    const handleClickStepperButton = () => {
      moveToStep(stepperButtonIndex + 1);
    };

    const classes = computeStepperButtonClasses({
      stepperButtonIndex,
      currentStep: state.currentStep,
    });

    return (
      <li
        key={`stepper-button-${stepperButtonIndex}`}
        className={styles.stepperListItem}
      >
        <button
          onClick={handleClickStepperButton}
          className={classes}
          data-testid={`stepper-button-${stepperButtonIndex}`}
        />
      </li>
    );
  });

  const carretClasses = computeCarretClasses({
    currentStep: state.currentStep,
  });

  return (
    <div className={styles.container}>
      <PictureSliderPictures {...state} />
      <div className={styles.slider}>
        <div className={styles.headerAndStepper}>
          <div className={styles.headersContainer}>
            <p className={styles.headerFixedSentence}>
              {t("PictureSlider.GET_YOUR_NEXT")}
            </p>
            <div className={styles.topicHeadersContainer}>{topicHeaders}</div>
          </div>
          <ul className={styles.stepper}>{stepperButtons}</ul>
        </div>
      </div>
      <div className={styles.footerCarretAndBlur}>
        <button
          className={carretClasses}
          onClick={onClickSeeBelow}
          data-testid="picture-slider-carret"
        >
          <FontAwesomeIcon
            icon={faAngleDown}
            className={styles.carretIcon}
            size="2x"
            data-testid="picture-slider-carret-icon"
          />
        </button>
        <button className={styles.footer} onClick={onClickSeeBelow}>
          <span className={styles.footerTextAndIcon}>
            {t("PictureSlider.HOW_IT_WORKS")}
            <FontAwesomeIcon icon={faAngleDown} className={styles.footerIcon} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default PictureSlider;
