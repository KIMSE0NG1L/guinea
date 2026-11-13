import type { GameState } from "../types";
import { t } from "../i18n";

// Save backup codes: the whole GameState as one pasteable line, for moving a game to another
// device without a server. "GINI1." + base64 of the JSON (non-ASCII escaped to \uXXXX first,
// so it's plain ASCII for btoa) + "." + a short checksum that catches a code cut off or
// mangled in transit.
const PREFIX = "GINI1.";

function checksum(text: string) {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash * 33) ^ text.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

export function encodeBackup(state: GameState) {
  const json = JSON.stringify(state).replace(/[\u007f-￿]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
  const body = btoa(json);
  return `${PREFIX}${body}.${checksum(body)}`;
}

// The state a code holds, or why it can't be used.
export function decodeBackup(code: string): { state: GameState } | { error: string } {
  const trimmed = code.replace(/\s+/g, "");
  if (!trimmed.startsWith(PREFIX)) return { error: t("기니 키우기 백업 코드가 아니에요.", "That's not a Guinea Life backup code.") };
  const rest = trimmed.slice(PREFIX.length);
  const dot = rest.lastIndexOf(".");
  if (dot < 0) return { error: t("코드가 중간에 잘린 것 같아요.", "The code looks like it got cut off partway through.") };
  const body = rest.slice(0, dot);
  if (checksum(body) !== rest.slice(dot + 1))
    return { error: t("코드가 중간에 잘렸거나 바뀐 것 같아요. 다시 복사해 주세요.", "The code looks cut off or altered. Please copy it again.") };
  try {
    const state = JSON.parse(atob(body)) as GameState;
    if (typeof state.level !== "number" || typeof state.stageNumber !== "number" || !Array.isArray(state.inventory)) {
      return { error: t("세이브 내용을 읽을 수 없어요.", "Couldn't read the save data.") };
    }
    return { state };
  } catch {
    return { error: t("세이브 내용을 읽을 수 없어요.", "Couldn't read the save data.") };
  }
}
