import { render, screen } from "@testing-library/react-native";
import { ElementType } from "react";
import { Image } from "react-native";

import LandingScreenGallery, {
  NUMBER_IMAGES_PER_COLUMN,
} from "./LandingScreenGallery";

// React 19's stricter `ElementType` no longer accepts React Native's `Image`
// value directly, so we assert it to the type `findAllByType` expects.
const ImageComponent = Image as unknown as ElementType;

it("renders the right number of images in each column", () => {
  render(<LandingScreenGallery />);

  const column0 = screen.getByTestId("landing-screen-gallery-column-0");
  const column1 = screen.getByTestId("landing-screen-gallery-column-1");
  const column2 = screen.getByTestId("landing-screen-gallery-column-2");

  const imagesInColumn0 = column0.findAllByType(ImageComponent);
  expect(imagesInColumn0).toHaveLength(NUMBER_IMAGES_PER_COLUMN);

  const imagesInColumn1 = column1.findAllByType(ImageComponent);
  expect(imagesInColumn1).toHaveLength(NUMBER_IMAGES_PER_COLUMN);

  const imagesInColumn2 = column2.findAllByType(ImageComponent);
  expect(imagesInColumn2).toHaveLength(NUMBER_IMAGES_PER_COLUMN);
});
