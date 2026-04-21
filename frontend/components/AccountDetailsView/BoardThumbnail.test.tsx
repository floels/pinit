import { BoardWithBasicDetails } from "@/lib/types/frontendTypes";
import BoardThumbnail from "./BoardThumbnail";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_ENDPOINT_ACCOUNT_DETAILS } from "@/lib/constants";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const renderComponent = ({ board }: { board: BoardWithBasicDetails }) => {
  render(
    <MemoryRouter>
      <BoardThumbnail username="johndoe" board={board} />
    </MemoryRouter>,
  );
};

it("renders cover picture and two secondary pictures if all are provided", () => {
  const board =
    MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_ACCOUNT_DETAILS].boards[0];

  renderComponent({ board });

  const coverPicture = screen.getByTestId("board-thumbnail-cover-picture");
  expect(coverPicture.getAttribute("src")).toBe(board.firstImageURLs[0]);

  const secondaryPicture1 = screen.getByTestId(
    "board-thumbnail-secondary-picture-1",
  );
  expect(secondaryPicture1.getAttribute("src")).toBe(board.firstImageURLs[1]);

  const secondaryPicture2 = screen.getByTestId(
    "board-thumbnail-secondary-picture-2",
  );
  expect(secondaryPicture2.getAttribute("src")).toBe(board.firstImageURLs[2]);
});

it(`renders cover picture and two placeholders for secondary pictures
if only one element in 'firstImageURLs'`, () => {
  const board =
    MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_ACCOUNT_DETAILS].boards[0];

  board.firstImageURLs = board.firstImageURLs.slice(0, 1);

  renderComponent({ board });

  const coverPicture = screen.getByTestId("board-thumbnail-cover-picture");
  expect(coverPicture.getAttribute("src")).toBe(board.firstImageURLs[0]);

  screen.getByTestId("board-thumbnail-secondary-picture-placeholder-1");
  screen.getByTestId("board-thumbnail-secondary-picture-placeholder-2");
});

it("renders three placeholders if 'firstImageURLs' is empty", () => {
  const board =
    MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_ACCOUNT_DETAILS].boards[0];

  board.firstImageURLs = [];

  renderComponent({ board });

  screen.getByTestId("board-thumbnail-cover-picture-placeholder");

  screen.getByTestId("board-thumbnail-secondary-picture-placeholder-1");
  screen.getByTestId("board-thumbnail-secondary-picture-placeholder-2");
});
