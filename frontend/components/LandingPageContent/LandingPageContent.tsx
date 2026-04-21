"use client";

import { useState, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import PictureSlider from "./PictureSlider";
import styles from "./LandingPageContent.module.css";
import SecondFold from "./SecondFold";
import ThirdFold from "./ThirdFold";
import FourthFold from "./FourthFold";
import FifthFold from "./FifthFold";

const NUMBER_FOLDS = 5;

export enum FOLD {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4,
  FIFTH = 5,
}

export enum SCROLL_DIRECTIONS {
  DOWN = "DOWN",
  UP = "UP",
}

export const SCROLLING_DEBOUNCING_TIME_MS = 80;

const computeContentClass = ({ currentFold }: { currentFold: number }) => {
  if (currentFold === 1) {
    return styles.content;
  }

  if (currentFold === 2) {
    return `${styles.content} ${styles.contentSecondFoldActive}`;
  }

  if (currentFold === 3) {
    return `${styles.content} ${styles.contentThirdFoldActive}`;
  }

  if (currentFold === 4) {
    return `${styles.content} ${styles.contentFourthFoldActive}`;
  }

  return `${styles.content} ${styles.contentFifthFoldActive}`;
};

const LandingPageContent = () => {
  // This will be needed to scroll back to the top of the page in the `useEffect` hook of the <FithFold /> child component,
  // Otherwise, for some reason, browsers scroll down to the <FifthFold /> component and focus on the first input of the
  // <SignupForm /> it renders on page load.
  const heroRef = useRef(null);

  const [currentFold, setCurrentFold] = useState(1);

  const handleClickHeroSeeBelow = () => {
    setCurrentFold(2); // i.e. move down from picture slider to search section
  };

  const handleClickBackToTop = () => {
    setCurrentFold(1);
  };

  const handleMouseWheel = (event: WheelEvent) => {
    if (event.deltaY > 0) {
      debouncedHandleScrollDown();
    } else if (event.deltaY < 0) {
      debouncedHandleScrollUp();
    }
  };

  const handleScrollDown = () => {
    setCurrentFold((currentFold) => {
      if (currentFold === NUMBER_FOLDS) {
        return currentFold;
      }

      return currentFold + 1;
    });
  };

  const debouncedHandleScrollDown = debounce(
    handleScrollDown,
    SCROLLING_DEBOUNCING_TIME_MS,
    { leading: true, trailing: false },
  );

  const handleScrollUp = () => {
    setCurrentFold((currentFold) => {
      if (currentFold === 1) {
        return currentFold;
      }

      return currentFold - 1;
    });
  };

  const debouncedHandleScrollUp = debounce(
    handleScrollUp,
    SCROLLING_DEBOUNCING_TIME_MS,
    { leading: true, trailing: false },
  );

  useEffect(() => {
    document.addEventListener("wheel", handleMouseWheel);

    return () => {
      document.removeEventListener("wheel", handleMouseWheel);
    };
  }, []);

  const contentClass = computeContentClass({ currentFold });

  return (
    <div className={styles.container}>
      <div className={contentClass} data-testid="landing-page-content">
        <div className={styles.hero} ref={heroRef}>
          <PictureSlider onClickSeeBelow={handleClickHeroSeeBelow} />
        </div>
        <SecondFold />
        <ThirdFold />
        <FourthFold />
        <FifthFold heroRef={heroRef} onClickBackToTop={handleClickBackToTop} />
      </div>
    </div>
  );
};

export default LandingPageContent;
