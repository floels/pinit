import { Link } from "react-router-dom";
import { BoardWithBasicDetails } from "@/lib/types/frontendTypes";
import styles from "./BoardThumbnail.module.css";

type BoardThumbnailProps = {
  username: string;
  board: BoardWithBasicDetails;
};

const COVER_PICTURE_SIZE_PX = 160;
const SECONDARY_PICTURE_SIZE_PX = 80;

const BoardThumbnail = ({ username, board }: BoardThumbnailProps) => {
  const { slug, name, firstImageURLs } = board;

  const coverImageURL = firstImageURLs.length > 0 ? firstImageURLs[0] : null;

  let coverImage;

  if (coverImageURL) {
    coverImage = (
      <img
        src={coverImageURL}
        alt={name}
        width={COVER_PICTURE_SIZE_PX}
        height={COVER_PICTURE_SIZE_PX}
        className={styles.coverPicture}
        data-testid="board-thumbnail-cover-picture"
      />
    );
  } else {
    coverImage = (
      <div
        className={styles.coverPicturePlaceholder}
        data-testid="board-thumbnail-cover-picture-placeholder"
      />
    );
  }

  const SecondaryImage = ({ index }: { index: number }) => {
    const imageURL =
      firstImageURLs.length > index ? firstImageURLs[index] : null;

    if (imageURL) {
      const imageClasses = [
        styles.secondaryPicture,
        index === 1 ? styles.topSecondaryPicture : null,
      ];

      const imageHeight =
        index === 1 ? SECONDARY_PICTURE_SIZE_PX - 1 : SECONDARY_PICTURE_SIZE_PX;
      // to account for 1px bottom border

      return (
        <img
          src={imageURL}
          alt={name}
          width={SECONDARY_PICTURE_SIZE_PX}
          height={imageHeight}
          className={imageClasses.join(" ")}
          data-testid={`board-thumbnail-secondary-picture-${index}`}
        />
      );
    }

    const placeholderClasses = [
      styles.secondaryPicturePlaceholder,
      index === 1 ? styles.topSecondaryPicturePlaceholder : null,
    ];

    return (
      <div
        className={placeholderClasses.join(" ")}
        data-testid={`board-thumbnail-secondary-picture-placeholder-${index}`}
      />
    );
  };

  return (
    <div className={styles.container}>
      <Link to={`/${username}/${slug}`} className={styles.content}>
        <div className={styles.imagesContainer}>
          {coverImage}
          <div className={styles.secondaryImages}>
            <SecondaryImage index={1} />
            <SecondaryImage index={2} />
          </div>
          <div className={styles.overlay} />
        </div>
        <span className={styles.title}>{name}</span>
      </Link>
    </div>
  );
};

export default BoardThumbnail;
