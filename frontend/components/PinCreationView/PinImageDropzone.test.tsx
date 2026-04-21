import { fireEvent, render, screen } from "@testing-library/react";
import PinImageDropzone from "./PinImageDropzone";
import en from "@/public/locales/en/PinCreation.json";
import { act } from "react-dom/test-utils";

const mockOnFileDropped = jest.fn();

const mockOnClickDeleteImage = jest.fn();

const renderComponent = ({
  imagePreviewURL,
}: {
  imagePreviewURL: string | null;
}) => {
  return render(
    <PinImageDropzone
      imagePreviewURL={imagePreviewURL}
      onFileDropped={mockOnFileDropped}
      onClickDeleteImage={mockOnClickDeleteImage}
    />,
  );
};

test("it renders file upload zone if 'imagePreviewURL' props is null", () => {
  renderComponent({ imagePreviewURL: null });

  screen.getByText(en.DROPZONE_INSTRUCTION);
});

test("it renders image preview if 'imagePreviewURL' props is not null", () => {
  const imagePreviewURL = "data:image/png;base64,acbdefg";

  renderComponent({ imagePreviewURL });

  expect(screen.queryByText(en.DROPZONE_INSTRUCTION)).toBeNull();

  const pinImage = screen.getByRole("img") as HTMLImageElement;

  expect(pinImage.src).toEqual(imagePreviewURL);
});

test("it calls 'onFileDropped' when user drops image file", async () => {
  const mockImageFile = new File(["mockImage"], "MockImage.png", {
    type: "image/png",
  });

  renderComponent({ imagePreviewURL: null });

  const dropzone = screen.getByTestId("pin-image-dropzone");

  await act(async () => {
    await fireEvent.drop(dropzone, { target: { files: [mockImageFile] } });
  });

  expect(mockOnFileDropped).toHaveBeenCalled();
});
