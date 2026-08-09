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
import { IMAGE_FADE_LAG_MS, IMAGE_URLS } from "./PictureSliderPicture";

type PictureSliderProps = {
  onClickSeeBelow: () => void;
};

type PictureSliderState = {
  previousStep: number | null;
  currentStep: number;
};

export const TIME_BEFORE_AUTOMATIC_STEP_CHANGE_MS = 5000;

// How long to keep previousStep set after a transition, so exit animations finish.
// Covers the longest possible cascade: (numImages - 1) * lag + CSS transition duration.
const NUM_IMAGES_PER_TOPIC = IMAGE_URLS.FOOD.length;
const CSS_TRANSITION_DURATION_MS = 700;
const PREVIOUS_STEP_CLEAR_DELAY_MS =
  (NUM_IMAGES_PER_TOPIC - 1) * IMAGE_FADE_LAG_MS + CSS_TRANSITION_DURATION_MS;

const computeHeaderClasses = ({
  topic,
  topicIndex,
  currentStep,
  previousStep,
}: {
  topic: TopicsType;
  topicIndex: number;
  currentStep: number;
  previousStep: number | null;
}) => {
  const isHeaderOfCurrentStep = topicIndex === currentStep - 1;
  const isHeaderOfPreviousStep =
    previousStep !== null && topicIndex === previousStep - 1;

  const defaultClasses = `${styles.topicHeader} ${
    styles[`topicHeader${_.capitalize(topic)}`]
  }`;

  if (isHeaderOfCurrentStep) {
    return `${defaultClasses} ${styles.topicHeaderVisible} ${styles.topicHeaderCenterPosition}`;
  }

  if (isHeaderOfPreviousStep) {
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
  const isStepperButtonOfCurrentStep = stepperButtonIndex === currentStep - 1;

  const correspondingTopic = PICTURE_SLIDER_TOPICS[stepperButtonIndex];

  const defaultClasses = `${styles.stepperButton} ${
    styles[`stepperButton${_.capitalize(correspondingTopic)}`]
  }`;

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
  });

  // Restart the auto-advance interval whenever the step changes, so a manual
  // click always resets the 5-second countdown.
  useEffect(() => {
    const timerId = setInterval(() => {
      setState((prevState) => ({
        previousStep: prevState.currentStep,
        currentStep:
          prevState.currentStep === 4 ? 1 : prevState.currentStep + 1,
      }));
    }, TIME_BEFORE_AUTOMATIC_STEP_CHANGE_MS);

    return () => clearInterval(timerId);
  }, [state.currentStep]);

  // Clear previousStep once all exit animations have had time to finish.
  // The dependency is 'previousStep', the value the effect reads. Depending on
  // 'currentStep' instead skipped the timer whenever a step change set
  // 'previousStep' without changing 'currentStep', which happens when the user
  // clicks the stepper button of the active topic.
  useEffect(() => {
    if (state.previousStep === null) return;

    const timerId = setTimeout(() => {
      setState((s) => ({ ...s, previousStep: null }));
    }, PREVIOUS_STEP_CLEAR_DELAY_MS);

    return () => clearTimeout(timerId);
  }, [state.previousStep]);

  const moveToStep = (newStep: number) => {
    setState((prevState) => ({
      previousStep: prevState.currentStep,
      currentStep: newStep,
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
