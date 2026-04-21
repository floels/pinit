"use client";

import { PinWithAuthorDetails } from "@/lib/types/frontendTypes";
import PinThumbnailContainer from "../PinsBoard/PinThumbnailContainer";
import { useEffect, useState } from "react";
import { useViewportWidth } from "@/lib/hooks/useViewportWidth";
import styles from "./PinThumbnailsGrid.module.css";

type PinThumbnailsGridProps = {
  pins: PinWithAuthorDetails[];
};

const GRID_COLUMN_WIDTH_WITH_MARGINS_PX = 236 + 2 * 8; // each column has a set width of 236px and side margins of 8px
const SIDE_PADDING_PX = 16; // should be consistent with the side padding of .thumbnailsGrid in CSS file
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

const PinThumbnailsGrid = ({ pins }: PinThumbnailsGridProps) => {
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

  // Here the logic is to:
  // - render as many columns as `numberOfColumns` (casted to number to avoid TypeScript errors),
  // - then, render the thumbnails in rows, e.g. if we have 3 columns:
  //   - thumbnail #1 goes to column #1,
  //   - thumbnail #2 goes to column #2,
  //   - thumbnail #3 goes to column #3,
  //   - thumbnail #4 goes to column #1, etc.
  // We do this by conditioning the rendering of thumbnail #pinThumbnailIndex (zero-based) to:
  // `if (pinThumbnailIndex % castedNumberOfColumns === columnIndex)`
  // which translates the logic above.
  return (
    <div className={styles.container}>
      {Array.from({ length: castedNumberOfColumns }).map((_, columnIndex) => {
        const isFirstColumn = columnIndex === 0;
        const isLastColumn = columnIndex === castedNumberOfColumns - 1;

        return (
          <div
            key={`thumbnails-column-${columnIndex}`}
            data-testid={`thumbnails-column-${columnIndex}`}
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
                  key={`pin-thumbnail-${pinIndex + 1}`}
                >
                  <PinThumbnailContainer
                    pin={pin}
                    isInFirstColumn={isFirstColumn}
                    isInLastColumn={isLastColumn}
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

export default PinThumbnailsGrid;
