import { render, screen } from "@testing-library/react";
import FifthFoldPicturesBackground, {
  PICTURE_URLS,
} from "./FifthFoldPicturesBackground";

it("renders <img> elements with proper 'src' attribute", () => {
  render(<FifthFoldPicturesBackground />);

  const images = screen.queryAllByRole("img") as HTMLImageElement[];

  images.forEach((image, index) => {
    expect(image.getAttribute("src")).toBe(PICTURE_URLS[index]);
  });
});
