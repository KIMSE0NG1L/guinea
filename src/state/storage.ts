import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GameState } from "../types";

const SAVE_KEY = "gini.save.v1";

export type SaveData = {
  state: GameState;
  pendingReward: number;
};

export async function loadSave(): Promise<SaveData | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export async function writeSave(data: SaveData): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Best-effort — losing a single autosave tick isn't worth surfacing to the player.
  }
}
