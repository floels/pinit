import { Dimensions, TouchableOpacity, View } from "react-native";

import PinThumbnail from "./PinThumbnail";
import styles from "./PinThumbnailsGrid.styles";

import { PinWithAuthorDetails } from "@/src/lib/types";

type PinsThumbnailsGridProps = {
  pins: PinWithAuthorDetails[];
  pinImageAspectRatios: (number | null)[];
  getTapHandlerForPin: ({
    pin,
    pinImageAspectRatio,
  }: {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  }) => () => void;
};

const NUMBER_COLUMNS = 2;
const MARGIN_BETWEEN_COLUMNS = 10;

const PinThumbnailsGrid = ({
  pins,
  pinImageAspectRatios,
  getTapHandlerForPin,
}: PinsThumbnailsGridProps) => {
  const screenWidth = Dimensions.get("window").width;

  // For N columns, we want (N+1) margins total on the screen,
  // counting the one at the far left and the one at the far right
  // of the screen. Therefore we should set:
  const columnWidth =
    (screenWidth - (NUMBER_COLUMNS + 1) * MARGIN_BETWEEN_COLUMNS) /
    NUMBER_COLUMNS;

  // Here the logic is to:
  // - render as many columns as `NUMBER_COLUMNS`,
  // - then, render the thumbnails in rows, e.g. if we have 3 columns:
  //   - thumbnail #1 goes to column #1,
  //   - thumbnail #2 goes to column #2,
  //   - thumbnail #3 goes to column #3,
  //   - thumbnail #4 goes to column #1, etc.
  // We do this by conditioning the rendering of thumbnail #pinThumbnailIndex (zero-based) to:
  // `if (pinThumbnailIndex % NUMBER_COLUMNS === columnIndex)`.
  return (
    <View style={styles.container}>
      {Array.from({ length: NUMBER_COLUMNS }).map((_, columnIndex) => (
        <View
          key={`thumbnails-column-${columnIndex}`}
          testID={`thumbnails-column-${columnIndex}`}
        >
          {pins.map((pin, pinIndex) => {
            const pinBelongsInThisColumn =
              pinIndex % NUMBER_COLUMNS === columnIndex;

            const pinImageAspectRatio = pinImageAspectRatios[pinIndex];

            const pinHasImageAspectRatio = !!pinImageAspectRatio;

            if (pinBelongsInThisColumn && pinHasImageAspectRatio) {
              return (
                <TouchableOpacity
                  key={`pin-thumbnail-${pinIndex + 1}`}
                  onPress={getTapHandlerForPin({ pin, pinImageAspectRatio })}
                >
                  <PinThumbnail
                    pin={pin}
                    pinImageAspectRatio={pinImageAspectRatio}
                    width={columnWidth}
                  />
                </TouchableOpacity>
              );
            }
          })}
        </View>
      ))}
    </View>
  );
};

export default PinThumbnailsGrid;
