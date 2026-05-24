import { PinWithFullDetails } from "@/lib/types/frontendTypes";
import CreatedPinThumbnailContainer from "./CreatedPinThumbnailContainer";
import { useEffect, useState } from "react";
import { useViewportWidth } from "@/lib/hooks/useViewportWidth";
import styles from "../../components/PinThumbnailsGrid/PinThumbnailsGrid.module.css";

type CreatedPinsGridProps = {
  pins: PinWithFullDetails[];
  isOwnProfile: boolean;
  onPinDeleted: (pinId: string) => void;
  onPinUpdated: (
    pinId: string,
    title: string | null,
    description: string | null,
  ) => void;
};

const GRID_COLUMN_WIDTH_WITH_MARGINS_PX = 236 + 2 * 8;
const SIDE_PADDING_PX = 16;
const MAX_NUMBER_COLUMNS = 8;

const getNumberOfColumns = (viewportWidth: number) => {
  const theoreticalNumberOfColumns = Math.floor(
    (viewportWidth - 2 * SIDE_PADDING_PX) / GRID_COLUMN_WIDTH_WITH_MARGINS_PX,
  );

  const boundedNumberOfColumns = Math.min(
    Math.max(theoreticalNumberOfColumns, 1),
    MAX_NUMBER_COLUMNS,
  );

  return boundedNumberOfColumns;
};

const CreatedPinsGrid = ({
  pins,
  isOwnProfile,
  onPinDeleted,
  onPinUpdated,
}: CreatedPinsGridProps) => {
  const [numberOfColumns, setNumberOfColumns] = useState<number | undefined>();

  const viewportWidth = useViewportWidth();

  useEffect(() => {
    if (viewportWidth) {
      const calculatedColumns = getNumberOfColumns(viewportWidth);
      setNumberOfColumns(calculatedColumns);
    }
  }, [viewportWidth]);

  if (!numberOfColumns) {
    return null;
  }

  const castedNumberOfColumns = numberOfColumns as number;

  return (
    <div className={styles.container}>
      {Array.from({ length: castedNumberOfColumns }).map((_, columnIndex) => {
        const isFirstColumn = columnIndex === 0;
        const isLastColumn = columnIndex === castedNumberOfColumns - 1;

        return (
          <div
            key={`thumbnails-column-${columnIndex}`}
            data-testid={`created-pins-column-${columnIndex}`}
          >
            {pins.map((pin, pinIndex) => {
              const pinBelongsToColumn =
                pinIndex % castedNumberOfColumns === columnIndex;

              if (!pinBelongsToColumn) {
                return null;
              }

              return (
                <div
                  className={styles.pinThumbnail}
                  key={`created-pin-thumbnail-${pin.id}`}
                >
                  <CreatedPinThumbnailContainer
                    pin={pin}
                    isInFirstColumn={isFirstColumn}
                    isInLastColumn={isLastColumn}
                    isOwnProfile={isOwnProfile}
                    onPinDeleted={onPinDeleted}
                    onPinUpdated={onPinUpdated}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default CreatedPinsGrid;
