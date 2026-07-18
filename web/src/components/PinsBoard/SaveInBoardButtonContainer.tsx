import { useState } from "react";
import { BoardWithBasicDetails } from "@/lib/types/frontendTypes";
import SaveInBoardButton from "./SaveInBoardButton";

type SaveInBoardButtonContainerProps = {
  board: BoardWithBasicDetails;
  handleClick: () => void;
};

const SaveInBoardButtonContainer = ({
  board,
  handleClick,
}: SaveInBoardButtonContainerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <SaveInBoardButton
      board={board}
      isHovered={isHovered}
      handleClick={handleClick}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
    />
  );
};

export default SaveInBoardButtonContainer;
