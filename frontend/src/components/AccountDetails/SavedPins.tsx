import { AccountWithPublicDetails } from "@/lib/types/frontendTypes";
import BoardThumbnail from "./BoardThumbnail";
import styles from "./SavedPins.module.css";

type SavedPinsProps = {
  account: AccountWithPublicDetails;
};

const SavedPins = ({ account }: SavedPinsProps) => {
  return (
    <ul className={styles.container}>
      {account.boards.map((board, index) => (
        <li key={`board-${index}`}>
          <BoardThumbnail board={board} username={account.username} />
        </li>
      ))}
    </ul>
  );
};

export default SavedPins;
