import { render } from "@testing-library/react";
import PinCreationView from "./PinCreationView";

// This component is completely covered by the tests in 'PinCreationViewContainer.test.tsx'.
it("renders", () => {
  const props = {
    hasDroppedFile: false,
    imagePreviewURL: null,
    pinDetails: { title: "", description: "" },
    isPosting: false,
    handleFileDropped: () => {},
    handleInputChange: () => {},
    handleSubmit: () => {},
    handleClickDeleteImage: () => {},
  };

  render(<PinCreationView {...props} />);
});
