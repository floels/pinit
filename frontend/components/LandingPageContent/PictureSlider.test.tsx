// Exceptionnally for this component, we take an "integration test" approach instead of a
// "unit test" approach, meaning we assume the behavior of child element <PictureSliderPicture />.
// This is because of the very narrow integration between <PictureSlider /> and <PictureSliderPictures />:
// they don't really make sense as separate components.
// This allows us to express assertions which are closer to what the user actually sees.

import { act, render, screen } from "@testing-library/react";
import PictureSlider, {
  TIMER_TIME_STEP_MS,
  TIME_BEFORE_AUTOMATIC_STEP_CHANGE_MS,
} from "./PictureSlider";
import { IMAGE_FADE_LAG_MS, IMAGE_URLS } from "./PictureSliderPicture";
import en from "@/public/locales/en/LandingPageContent.json";
import _ from "lodash";
import userEvent from "@testing-library/user-event";
import { PICTURE_SLIDER_TOPICS, TopicsType } from "./PictureSliderPictures";

const messages = en.PictureSlider;

const NUMBER_IMAGES_PER_TOPIC = IMAGE_URLS.FOOD.length;

const mockOnClickSeeBelow = jest.fn();

const renderComponent = () => {
  render(<PictureSlider onClickSeeBelow={mockOnClickSeeBelow} />);
};

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

it(`shows only header for first topic,
shows proper step in stepper, and
styles elements with proper color upon initial render`, () => {
  renderComponent();

  // Check that only first header is visible
  const headerFood = screen.getByText(messages.HEADER_FOOD);
  expect(headerFood.className).toEqual(
    "topicHeader topicHeaderFood topicHeaderVisible topicHeaderCenterPosition",
  );

  PICTURE_SLIDER_TOPICS.forEach((topic) => {
    if (topic !== TopicsType.FOOD) {
      const headerText = messages[`HEADER_${topic}`];
      const header = screen.getByText(headerText);
      expect(header.className).toEqual(
        `topicHeader topicHeader${_.capitalize(topic)}`,
      );
    }
  });

  // Check that only first step of stepper is active and has proper styling
  const firstStepperButton = screen.getByTestId("stepper-button-0");
  expect(firstStepperButton.className).toEqual(
    "stepperButton stepperButtonFood stepperButtonActive",
  );

  PICTURE_SLIDER_TOPICS.forEach((_, index) => {
    if (index > 0) {
      const stepperButton = screen.getByTestId(`stepper-button-${index}`);
      expect(stepperButton).not.toHaveClass("stepperButtonActive");
    }
  });

  // Check that carret has proper styling
  const carret = screen.getByTestId("picture-slider-carret");
  expect(carret.className).toEqual("carret carretFood");
});

it(`after the first automatic topic transition, should show only header for second topic,
should show proper step in stepper, and
should style elements with proper color`, () => {
  renderComponent();

  const timeRightAfterFirstAutomaticTopicTransition =
    TIME_BEFORE_AUTOMATIC_STEP_CHANGE_MS + TIMER_TIME_STEP_MS;

  act(() => {
    jest.advanceTimersByTime(timeRightAfterFirstAutomaticTopicTransition);
  });

  // Check that only second header is visible
  const headerHome = screen.getByText(messages.HEADER_HOME);
  expect(headerHome.className).toEqual(
    "topicHeader topicHeaderHome topicHeaderVisible topicHeaderCenterPosition",
  );

  PICTURE_SLIDER_TOPICS.forEach((topic) => {
    if (topic === TopicsType.FOOD) {
      const headerFood = screen.getByText(messages.HEADER_FOOD);
      expect(headerFood.className).toEqual(
        "topicHeader topicHeaderFood topicHeaderTopPosition",
      );
    } else if (topic !== TopicsType.HOME) {
      const headerText = messages[`HEADER_${topic}`];
      const header = screen.getByText(headerText);
      expect(header.className).toEqual(
        `topicHeader topicHeader${_.capitalize(topic)}`,
      );
    }
  });

  // Check that only second step of stepper is active and has proper styling
  const secondStepperButton = screen.getByTestId("stepper-button-1");
  expect(secondStepperButton.className).toEqual(
    "stepperButton stepperButtonHome stepperButtonActive",
  );

  PICTURE_SLIDER_TOPICS.forEach((_, index) => {
    if (index !== 1) {
      const stepperButton = screen.getByTestId(`stepper-button-${index}`);
      expect(stepperButton).not.toHaveClass("stepperButtonActive");
    }
  });

  // Check that carret has proper styling
  const carret = screen.getByTestId("picture-slider-carret");
  expect(carret.className).toEqual("carret carretHome");
});

it("after the first timer step, should show only first image of first topic in central position", () => {
  renderComponent();

  act(() => {
    jest.advanceTimersByTime(TIMER_TIME_STEP_MS);
  });

  const firstPictureFirstTopic = screen.getByTestId(
    "picture-slider-picture-food-0",
  );
  expect(firstPictureFirstTopic.className).toEqual(
    "image imageVisible imageCenterPosition",
  );

  PICTURE_SLIDER_TOPICS.forEach((topic) => {
    for (let i = 0; i < NUMBER_IMAGES_PER_TOPIC; i++) {
      if (topic === "FOOD" && i === 0) continue;

      const pictureTestId = `picture-slider-picture-${topic.toLowerCase()}-${i}`;
      const picture = screen.getByTestId(pictureTestId);

      expect(picture.className).toEqual("image"); // i.e. no 'imageVisible' or other class
    }
  });
});

it("after the first image lag interval, should show only first two images of first topic", () => {
  renderComponent();

  const timeRightAfterImageFadeLag = IMAGE_FADE_LAG_MS + TIMER_TIME_STEP_MS;

  act(() => {
    jest.advanceTimersByTime(timeRightAfterImageFadeLag);
  });

  const firstPictureFirstTopic = screen.getByTestId(
    "picture-slider-picture-food-0",
  );
  expect(firstPictureFirstTopic.className).toEqual(
    "image imageVisible imageCenterPosition",
  );

  const secondPictureFirstTopic = screen.getByTestId(
    "picture-slider-picture-food-1",
  );
  expect(secondPictureFirstTopic.className).toEqual(
    "image imageVisible imageCenterPosition",
  );

  PICTURE_SLIDER_TOPICS.forEach((topic) => {
    for (let i = 0; i < NUMBER_IMAGES_PER_TOPIC; i++) {
      if (topic === "FOOD" && i <= 1) continue;

      const pictureTestId = `picture-slider-picture-${topic.toLowerCase()}-${i}`;
      const picture = screen.getByTestId(pictureTestId);

      expect(picture.className).toEqual("image"); // i.e. no 'imageVisible' or other class
    }
  });
});

it(`after the first automatic topic transition, should no longer show first image
of first topic, should still show second image of first topic, 
and should show first image of second topic`, () => {
  renderComponent();

  const timeRightAfterFirstAutomaticTopicTransition =
    TIME_BEFORE_AUTOMATIC_STEP_CHANGE_MS + TIMER_TIME_STEP_MS;

  act(() => {
    jest.advanceTimersByTime(timeRightAfterFirstAutomaticTopicTransition);
  });

  const firstPictureFirstTopic = screen.getByTestId(
    "picture-slider-picture-food-0",
  );
  expect(firstPictureFirstTopic.className).toEqual("image imageTopPosition");

  const secondPictureFirstTopic = screen.getByTestId(
    "picture-slider-picture-food-1",
  );
  expect(secondPictureFirstTopic.className).toEqual(
    "image imageVisible imageCenterPosition",
  );

  const secondPictureSecondTopic = screen.getByTestId(
    "picture-slider-picture-home-0",
  );
  expect(secondPictureSecondTopic.className).toEqual(
    "image imageVisible imageCenterPosition",
  );
});

it("moves to corresponding step when user clicks stepper button", async () => {
  jest.useRealTimers(); // otherwise `await userEvent.click(...);` times out for some reason

  renderComponent();

  const headerOutfit = screen.getByText(messages.HEADER_OUTFIT);

  expect(headerOutfit.className).toEqual("topicHeader topicHeaderOutfit"); // ie not visible

  const stepperButtonOutfit = screen.getByTestId("stepper-button-2");

  await userEvent.click(stepperButtonOutfit);

  expect(headerOutfit.className).toEqual(
    "topicHeader topicHeaderOutfit topicHeaderVisible topicHeaderCenterPosition",
  );
});
