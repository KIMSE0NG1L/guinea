import { useEffect, useState } from "react";
import { Image, View, type ImageSourcePropType } from "react-native";

type Props = {
  source: ImageSourcePropType;
  frameSize: number; // native px per frame in the source strip (160 for all current strips)
  frameCount: number; // 5 for guinea strips, 4 for boss strips
  displaySize: number; // rendered box size on screen, e.g. 108
  durationMs: number; // full-cycle duration, ported verbatim from the web CSS animation-duration
  mode: "loop" | "once"; // loop = idle breathing; once = CSS "both" fill, holds last frame
  repeat?: number; // "once" mode only: play the full cycle this many times before holding (default 1)
  restartKey?: string | number; // change this to force the animation to restart from frame 0 (mirrors the web's key={tick} remount trick)
  onComplete?: () => void;
  // Recolors every opaque pixel this flat color, keeping the sprite's own silhouette —
  // used to flash a hit-reaction overlay exactly matching the current frame's shape.
  tintColor?: string;
};

export function SpriteStrip({
  source,
  frameSize,
  frameCount,
  displaySize,
  durationMs,
  mode,
  repeat = 1,
  restartKey,
  onComplete,
  tintColor,
}: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    if (frameCount <= 1) return;
    // CSS steps(frameCount - 1) visits frameCount frames across durationMs with no easing.
    const stepMs = durationMs / (frameCount - 1);
    let current = 0;
    let cyclesDone = 0;
    const id = setInterval(() => {
      current += 1;
      if (current >= frameCount) {
        if (mode === "loop") {
          current = 0;
        } else {
          cyclesDone += 1;
          if (cyclesDone < repeat) {
            current = 0;
          } else {
            clearInterval(id);
            current = frameCount - 1;
            setFrame(current);
            onComplete?.();
            return;
          }
        }
      }
      setFrame(current);
    }, stepMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, frameCount, durationMs, mode, repeat, restartKey]);

  const scale = displaySize / frameSize;

  return (
    <View style={{ width: displaySize, height: displaySize, overflow: "hidden" }}>
      <Image
        source={source}
        resizeMode="stretch"
        tintColor={tintColor}
        style={{
          width: frameSize * frameCount * scale,
          height: frameSize * scale,
          transform: [{ translateX: -frame * frameSize * scale }],
        }}
      />
    </View>
  );
}
