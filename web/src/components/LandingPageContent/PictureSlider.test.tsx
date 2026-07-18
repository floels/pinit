// Exceptionnally for this component, we take an "integration test" approach instead of a
// "unit test" approach, meaning we assume the behavior of child element <PictureSliderPicture />.
// This is because of the very narrow integration between <PictureSlider /> and <PictureSliderPictures />:
// they don't really make sense as separate components.
// This allows us to express assertions which are closer to what the user actually sees.

import { act, render, screen } from "@testing-library/react";
import PictureSlider, {
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

  act(() => {
    jest.advanceTimersByTime(TIME_BEFORE_AUTOMATIC_STEP_CHANGE_MS);
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

it("on initial render, all images of first topic are visible with cascade transition delays", () => {
  renderComponent();

  for (let i = 0; i < NUMBER_IMAGES_PER_TOPIC; i++) {
    const picture = screen.getByTestId(`picture-slider-picture-food-${i}`);
    expect(picture.className).toEqual("image imageVisible imageCenterPosition");
    expect(picture).toHaveStyle(`transition-delay: ${i * IMAGE_FADE_LAG_MS}ms`);
  }

  // All other topic images are in the default (invisible) state
  PICTURE_SLIDER_TOPICS.forEach((topic) => {
    if (topic === TopicsType.FOOD) return;
    for (let i = 0; i < NUMBER_IMAGES_PER_TOPIC; i++) {
      const picture = screen.getByTestId(
        `picture-slider-picture-${topic.toLowerCase()}-${i}`,
      );
      expect(picture.className).toEqual("image");
    }
  });
});

it(`after the first automatic topic transition, all images of the first topic should be in
top position and all images of the second topic should be visible`, () => {
  renderComponent();

  act(() => {
    jest.advanceTimersByTime(TIME_BEFORE_AUTOMATIC_STEP_CHANGE_MS);
  });

  // All FOOD images are exiting (top position) with cascade delays
  for (let i = 0; i < NUMBER_IMAGES_PER_TOPIC; i++) {
    const picture = screen.getByTestId(`picture-slider-picture-food-${i}`);
    expect(picture.className).toEqual("image imageTopPosition");
    expect(picture).toHaveStyle(`transition-delay: ${i * IMAGE_FADE_LAG_MS}ms`);
  }

  // All HOME images are entering (visible) with cascade delays
  for (let i = 0; i < NUMBER_IMAGES_PER_TOPIC; i++) {
    const picture = screen.getByTestId(`picture-slider-picture-home-${i}`);
    expect(picture.className).toEqual("image imageVisible imageCenterPosition");
    expect(picture).toHaveStyle(`transition-delay: ${i * IMAGE_FADE_LAG_MS}ms`);
  }
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
