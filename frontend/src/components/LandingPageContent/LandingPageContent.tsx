import { useEffect, useRef } from "react";
import PictureSlider from "./PictureSlider";
import styles from "./LandingPageContent.module.css";
import SecondFold from "./SecondFold";
import ThirdFold from "./ThirdFold";
import FourthFold from "./FourthFold";
import FifthFold from "./FifthFold";

const LandingPageContent = () => {
  const firstFoldRef = useRef<HTMLDivElement>(null);
  const secondFoldRef = useRef<HTMLDivElement>(null);

  const handleClickHeroSeeBelow = () => {
    secondFoldRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClickBackToTop = () => {
    firstFoldRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Counteracts browsers auto-scrolling to the autoFocus'd input in <SignupForm /> on page load.
  useEffect(() => {
    firstFoldRef.current?.scrollIntoView();
  }, []);

  return (
    <div className={styles.container} data-testid="landing-page-content">
      <div className={styles.hero} ref={firstFoldRef}>
        <PictureSlider onClickSeeBelow={handleClickHeroSeeBelow} />
      </div>
      <div ref={secondFoldRef}>
        <SecondFold />
      </div>
      <ThirdFold />
      <FourthFold />
      <FifthFold onClickBackToTop={handleClickBackToTop} />
    </div>
  );
};

export default LandingPageContent;
