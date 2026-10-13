import { useEffect, useState } from "react";
import { Image, View, type ImageSourcePropType } from "react-native";

type Props = {
  source: ImageSourcePropType;
  frameSize: number; // native px per frame in the source strip (228 for all current strips)
  frameCount: number; // 5 for guinea strips, 4 for boss strips
  displaySize: number; // rendered box size on screen, e.g. 108
  durationMs: number; // full-cycle duration, ported verbatim from the web CSS animation-duration
  mode: "loop" | "once"; // loop = idle breathing; once = CSS "both" fill, holds last frame
  restartKey?: string | number; // change this to force the animation to restart from frame 0 (mirrors the web's key={tick} remount trick)
  onComplete?: () => void;
};

export function SpriteStrip({
  source,
  frameSize,
  frameCount,
  displaySize,
  durationMs,
  mode,
  restartKey,
  onComplete,
}: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    if (frameCount <= 1) return;
    // CSS steps(frameCount - 1) visits frameCount frames across durationMs with no easing.
    const stepMs = durationMs / (frameCount - 1);
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      if (current >= frameCount) {
        if (mode === "loop") {
          current = 0;
        } else {
          clearInterval(id);
          current = frameCount - 1;
          setFrame(current);
          onComplete?.();
          return;
        }
      }
      setFrame(current);
    }, stepMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, frameCount, durationMs, mode, restartKey]);

  const scale = displaySize / frameSize;

  return (
    <View style={{ width: displaySize, height: displaySize, overflow: "hidden" }}>
      <Image
        source={source}
        resizeMode="stretch"
        style={{
          width: frameSize * frameCount * scale,
          height: frameSize * scale,
          transform: [{ translateX: -frame * frameSize * scale }],
        }}
      />
    </View>
  );
}
