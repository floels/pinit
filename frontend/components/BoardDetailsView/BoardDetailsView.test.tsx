import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BoardDetailsView from "./BoardDetailsView";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_ENDPOINT_BOARD_DETAILS } from "@/lib/constants";
import en from "@/public/locales/en/BoardDetails.json";

const board = MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_BOARD_DETAILS];

const renderComponent = () => {
  render(
    <MemoryRouter>
      <BoardDetailsView board={board} />
    </MemoryRouter>,
  );
};

it("renders board details", () => {
  renderComponent();

  screen.getByText(board.name);

  const authorProfilePicture = screen.getByTestId(
    "board-author-profile-picture",
  );

  expect(authorProfilePicture.getAttribute("src")).toBe(board.author.profilePictureURL);

  screen.getByText(`${board.pins.length} ${en.PINS}`);

  const pinThumbnails = screen.getAllByTestId("pin-thumbnail");

  expect(pinThumbnails).toHaveLength(board.pins.length);
});
