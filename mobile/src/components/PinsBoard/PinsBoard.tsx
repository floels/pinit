import { useTranslation } from "react-i18next";
import {
  ScrollView,
  View,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import PinThumbnailsGrid from "./PinThumbnailsGrid";
import styles from "./PinsBoard.styles";

import Spinner from "@/src/components/Spinner/Spinner";
import { PinWithAuthorDetails } from "@/src/lib/types";

type PinsBoardProps = {
  pins: PinWithAuthorDetails[];
  pinImageAspectRatios: (number | null)[];
  isFetchingMorePins: boolean;
  fetchMorePinsError: string;
  isRefreshing: boolean;
  hasJustRefreshed: boolean;
  refreshError: string;
  emptyResultsMessageKey?: string;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  getTapHandlerForPin: ({
    pin,
    pinImageAspectRatio,
  }: {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  }) => () => void;
};

const SCROLL_EVENT_THROTTLE = 32;
export const THRESHOLD_PULL_TO_REFRESH = 100;
const SIZE_REFRESH_SPINNER = 40;

const PinsBoard = ({
  pins,
  pinImageAspectRatios,
  isFetchingMorePins,
  fetchMorePinsError,
  isRefreshing,
  hasJustRefreshed,
  refreshError,
  emptyResultsMessageKey,
  handleScroll,
  getTapHandlerForPin,
}: PinsBoardProps) => {
  const { t } = useTranslation();

  const displayRefreshError = (
    <View style={styles.error}>
      <FontAwesome5Icon
        name="exclamation-circle"
        style={styles.errorIcon}
        size={20}
      />
      <Text style={styles.errorText}>{refreshError}</Text>
    </View>
  );

  const fetchMorePinsSpinner = (
    <Spinner containerStyle={styles.fetchMorePinsSpinner}>
      <FontAwesome5Icon
        name="spinner"
        size={40}
        style={styles.fetchMorePinsSpinnerIcon}
      />
    </Spinner>
  );

  const displayFetchMorePinsError = (
    <View style={styles.error}>
      <FontAwesome5Icon
        name="exclamation-circle"
        style={styles.errorIcon}
        size={20}
      />
      <Text style={styles.errorText}>{fetchMorePinsError}</Text>
    </View>
  );

  let displayEmptyResultsMessageIfNeeded;

  const shouldDisplayEmptyResultsMessage =
    !!emptyResultsMessageKey &&
    !isFetchingMorePins &&
    !fetchMorePinsError &&
    !isRefreshing &&
    !refreshError &&
    pins.length === 0;

  if (shouldDisplayEmptyResultsMessage) {
    displayEmptyResultsMessageIfNeeded = (
      <View style={styles.error}>
        <FontAwesome5Icon
          name="exclamation-circle"
          style={styles.errorIcon}
          size={20}
        />
        <Text style={styles.errorText}>{t(emptyResultsMessageKey)}</Text>
      </View>
    );
  }

  const scrollAnimatedValue = new Animated.Value(0);

  const refreshSpinnerPreviewScale = scrollAnimatedValue.interpolate({
    inputRange: [-THRESHOLD_PULL_TO_REFRESH, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const refreshSpinnerPreviewOpacity = scrollAnimatedValue.interpolate({
    inputRange: [-THRESHOLD_PULL_TO_REFRESH, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const refreshSpinnerPreviewAngle = scrollAnimatedValue.interpolate({
    inputRange: [-THRESHOLD_PULL_TO_REFRESH, 0],
    outputRange: ["360deg", "0deg"],
    extrapolate: "clamp",
  });

  const updateAnimatedValueOnScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollAnimatedValue } } }],
    { useNativeDriver: false },
  );

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    updateAnimatedValueOnScroll(event);
    handleScroll(event);
  };

  const refreshSpinnerPreview = (
    <Animated.View
      style={[
        styles.refreshSpinnerPreview,
        {
          top: -SIZE_REFRESH_SPINNER,
          transform: [
            {
              scale: refreshSpinnerPreviewScale,
            },
            {
              rotate: refreshSpinnerPreviewAngle,
            },
          ],
          opacity: refreshSpinnerPreviewOpacity,
        },
      ]}
    >
      <FontAwesome5Icon
        name="spinner"
        size={SIZE_REFRESH_SPINNER}
        style={styles.refreshSpinnerPreviewIcon}
      />
    </Animated.View>
  );

  const refreshSpinner = (
    <Spinner>
      <FontAwesome5Icon
        name="spinner"
        size={SIZE_REFRESH_SPINNER}
        style={styles.refreshSpinnerIcon}
      />
    </Spinner>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={SCROLL_EVENT_THROTTLE}
      scrollEnabled={
        // Disable scroll while refreshing, otherwise it creates
        // a jump when the user continues scrolling down past the
        // refresh threshold:
        !isRefreshing
      }
      testID="pins-board-scroll-view"
    >
      {isRefreshing && refreshSpinner}
      {!isRefreshing && !hasJustRefreshed && refreshSpinnerPreview}
      {refreshError && displayRefreshError}
      {displayEmptyResultsMessageIfNeeded}
      <PinThumbnailsGrid
        pins={pins}
        pinImageAspectRatios={pinImageAspectRatios}
        getTapHandlerForPin={getTapHandlerForPin}
      />
      {isFetchingMorePins && fetchMorePinsSpinner}
      {fetchMorePinsError && displayFetchMorePinsError}
    </ScrollView>
  );
};

export default PinsBoard;
