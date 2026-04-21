import { useState, useEffect } from "react";

export const useViewportWidth = () => {
  const [width, setWidth] = useState<number | undefined>(undefined); // NB: we need
  // to initialize `width` to `undefined` because the `window` object is not available
  // during the initial SSR pass.

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window width:
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
};
