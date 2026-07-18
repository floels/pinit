import { render, screen } from "@testing-library/react-native";
import { Image } from "react-native";

import LandingScreenGallery, {
  NUMBER_IMAGES_PER_COLUMN,
} from "./LandingScreenGallery";

it("renders the right number of images in each column", () => {
  render(<LandingScreenGallery />);

  const column0 = screen.getByTestId("landing-screen-gallery-column-0");
  const column1 = screen.getByTestId("landing-screen-gallery-column-1");
  const column2 = screen.getByTestId("landing-screen-gallery-column-2");

  const imagesInColumn0 = column0.findAllByType(Image);
  expect(imagesInColumn0).toHaveLength(NUMBER_IMAGES_PER_COLUMN);

  const imagesInColumn1 = column1.findAllByType(Image);
  expect(imagesInColumn1).toHaveLength(NUMBER_IMAGES_PER_COLUMN);

  const imagesInColumn2 = column2.findAllByType(Image);
  expect(imagesInColumn2).toHaveLength(NUMBER_IMAGES_PER_COLUMN);
});
