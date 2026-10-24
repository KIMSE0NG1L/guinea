import { useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { colors } from "../theme";

const TRACK_HEIGHT = 10;
const THUMB_SIZE = 24;

// A drag-and-tap volume bar (0-1). No slider library on this project yet — PanResponder
// is built into react-native core, so this avoids adding a native dependency (and the
// dev-build rebuild that would need) for one settings control.
//
// Rebuilt fresh every render instead of memoized in a ref: RN re-reads whichever
// panHandlers are currently on the View on each touch, so there's no gesture-continuity
// cost to that, and it lets the handlers close over the current `trackWidth` state
// directly — no separate mutable width-tracking ref needed (which the project's
// react-hooks/refs lint rule disallows reading from inside a responder created at
// render time anyway).
export function VolumeSlider({
  value,
  onChange,
  accessibilityLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const setValueFromX = (x: number) => {
    if (trackWidth <= 0) return;
    onChange(Math.min(1, Math.max(0, x / trackWidth)));
  };
  const panHandlers = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => setValueFromX(event.nativeEvent.locationX),
    onPanResponderMove: (event) => setValueFromX(event.nativeEvent.locationX),
  }).panHandlers;

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      style={styles.touchArea}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      {...panHandlers}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value * 100}%` }]} />
      </View>
      <View
        style={[
          styles.thumb,
          { left: Math.max(0, Math.min(trackWidth, value * trackWidth) - THUMB_SIZE / 2) },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  touchArea: { height: THUMB_SIZE, justifyContent: "center" },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.line,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: colors.gold },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderColor: colors.line,
  },
});
