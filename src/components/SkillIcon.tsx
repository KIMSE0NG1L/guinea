import { Image } from "react-native";
import { SKILL_ICON_ASPECT, skillImages } from "../assets";
import type { SkillId } from "../state/skills";

// Sized by height; each icon keeps its own proportions.
export function SkillIcon({ id, height }: { id: SkillId; height: number }) {
  return <Image source={skillImages[id]} style={{ width: height * SKILL_ICON_ASPECT[id], height }} />;
}
