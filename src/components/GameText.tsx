import { Children, forwardRef, isValidElement, cloneElement, useState, type ElementRef, type ReactNode } from "react";
import { Platform, StyleSheet, Text as RNText, type LayoutChangeEvent, type TextProps, type TextStyle } from "react-native";
import { semanticBreak } from "./semanticBreak";

// Drop-in for react-native's Text that wraps Korean by word (어절) instead of mid-word.
// - iOS: the system's hangul-word line break strategy.
// - Android: no such option, so a WORD JOINER (U+2060, zero-width) is slipped between
//   Hangul syllables of the same word — lines can then only break at spaces.
// - Web: handled once for the whole page with CSS (`word-break: keep-all`, see
//   installWebWordBreak) since react-native-web renders Text as plain DOM text.
const HANGUL_PAIR = /([가-힣])(?=[가-힣])/g;

function joinHangul(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") return child.replace(HANGUL_PAIR, "$1⁠");
    if (isValidElement(child) && child.type === RNText) {
      const props = child.props as TextProps;
      return cloneElement(child, undefined, joinHangul(props.children));
    }
    return child;
  });
}

// The whole text when `children` is plain text (strings/numbers only), else null.
function plainText(children: ReactNode): string | null {
  let text = "";
  for (const child of Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number") text += String(child);
    else return null;
  }
  return text;
}

// Web's own balancing, used until the semantic breaks below have been measured in.
const BALANCED = { textWrap: "balance" } as unknown as TextStyle;

export const Text = forwardRef<ElementRef<typeof RNText>, TextProps>(function GameText(props, ref) {
  const { children, style, onLayout } = props;
  const flat = StyleSheet.flatten(style) ?? {};
  const centered = flat.textAlign === "center";
  const text = centered ? plainText(children) : null;
  // Centred plain copy that wraps gets its line breaks re-placed (semanticBreak): measured
  // once at its natural width, then re-rendered with "\n" at even, sentence-friendly spots.
  const [measured, setMeasured] = useState<{ text: string; width: number } | null>(null);
  const fontSize = flat.fontSize ?? 14;
  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout?.(event);
    if (text === null || measured?.text === text) return;
    const { width, height } = event.nativeEvent.layout;
    const lineHeight = typeof flat.lineHeight === "number" ? flat.lineHeight : fontSize * 1.3;
    if (height > lineHeight * 1.5) setMeasured({ text, width });
  };
  // Wrapped lines sit at 1.3× the font size unless a style sets its own line height —
  // the fonts' natural spacing reads cramped once text runs onto a second line.
  const spacing: TextStyle | undefined = typeof flat.lineHeight === "number" || flat.fontSize === undefined ? undefined : { lineHeight: Math.round(flat.fontSize * 1.3) };
  let content: ReactNode = children;
  if (text !== null && measured?.text === text) content = semanticBreak(text, measured.width, fontSize);

  if (Platform.OS === "android") {
    return (
      <RNText ref={ref} {...props} style={[style, spacing]} onLayout={text !== null ? handleLayout : onLayout}>
        {joinHangul(content)}
      </RNText>
    );
  }
  return (
    <RNText
      ref={ref}
      lineBreakStrategyIOS="hangul-word"
      {...props}
      style={[style, spacing, Platform.OS === "web" && centered ? BALANCED : null]}
      onLayout={text !== null ? handleLayout : onLayout}
    >
      {content}
    </RNText>
  );
});

// Called once at startup on web: keep Korean words whole when wrapping, but still let a
// single over-long token break rather than spill out of its box.
export function installWebWordBreak() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = "body, body * { word-break: keep-all; overflow-wrap: anywhere; }";
  document.head.appendChild(style);
}
