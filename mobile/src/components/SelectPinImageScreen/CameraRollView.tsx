import FontAwesome5Icon from "@expo/vector-icons/FontAwesome5";
import {
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import styles, { SPACE_BETWEEN_COLUMNS } from "./CameraRollView.styles";

import { CameraRollPhoto } from "@/src/hooks/useCameraRollPhotos";

type CameraRollViewProps = {
  cameraRollPhotos: CameraRollPhoto[];
  selectedImageIndex: number | null;
  getPressHandlerForImage: ({
    imageIndex,
  }: {
    imageIndex: number;
  }) => () => void;
};

const NUMBER_COLUMNS = 4;

const CameraRollView = ({
  cameraRollPhotos,
  selectedImageIndex,
  getPressHandlerForImage,
}: CameraRollViewProps) => {
  const { width: windowWidth } = useWindowDimensions();

  const imageWidth =
    (windowWidth - SPACE_BETWEEN_COLUMNS * (NUMBER_COLUMNS - 1)) /
    NUMBER_COLUMNS;

  return (
    <FlatList
      data={cameraRollPhotos}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => {
        const isInLastColumn = (index + 1) % NUMBER_COLUMNS === 0;

        const imageStyle = isInLastColumn
          ? styles.image
          : [styles.image, styles.imageNotInLastColumn];

        const isImageSelected = index === selectedImageIndex;

        return (
          <TouchableOpacity
            style={imageStyle}
            onPress={getPressHandlerForImage({ imageIndex: index })}
          >
            <Image
              source={{ uri: item.uri }}
              width={imageWidth}
              height={imageWidth}
              testID={`camera-roll-image-${index}`}
            />
            {isImageSelected && (
              <View style={styles.selectedImageOverlay}>
                <FontAwesome5Icon name="check" size={30} color="white" />
              </View>
            )}
          </TouchableOpacity>
        );
      }}
      numColumns={NUMBER_COLUMNS}
    />
  );
};

export default CameraRollView;
