import { useState, useEffect } from "react";

export const useViewportWidth = () => {
  // Read the width during the first render. This app is a client-only SPA, so
  // `window` always exists here. Callers therefore never see `undefined`, and
  // they render their real content on the first pass.
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // The width can change between the first render and this subscription:
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
};
