import type { View } from "react-native";

// Buttons a guided tutorial can point at, by id. A screen tags its button with
// `ref={tutorialRef("cook-green-jelly")}`; the guide measures it to cut a hole in its dim
// layer and drop an arrow on it, so the player presses the real button themselves.
const targets = new Map<string, View>();

export function tutorialRef(id: string | undefined) {
  return (node: View | null) => {
    if (!id) return;
    if (node) targets.set(id, node);
    else targets.delete(id);
  };
}

export type TargetRect = { x: number; y: number; width: number; height: number };

// Window-space rect of a tagged button, or null when it isn't mounted / laid out yet.
export function measureTarget(id: string): Promise<TargetRect | null> {
  const node = targets.get(id);
  if (!node) return Promise.resolve(null);
  return new Promise((resolve) => {
    node.measureInWindow((x, y, width, height) => resolve(width > 0 && height > 0 ? { x, y, width, height } : null));
  });
}
