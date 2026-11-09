import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// A dish can simmer up to 2 hours (COOK_TIME_MS.hidden) — long enough that the player's
// likely to have left the app by the time it's ready. This schedules one local notification
// per pot at the moment it starts cooking, so the OS delivers it on its own even if the app
// gets backgrounded or killed in the meantime; nothing here depends on the app staying alive.
const CHANNEL_ID = "cooking";

// Shown if the notification happens to land while the app is open (e.g. another tab).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Android's permission prompt only appears once at least one channel exists, so this runs
// before every permission request rather than once at startup. Cheap to repeat — creating an
// existing channel again is a no-op past its name/description.
async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "요리 완성",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function ensurePermission(): Promise<boolean> {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// Null if permission was denied or readyAt's already passed (nothing worth scheduling for —
// collectDish lets it be picked up free the moment it's actually done either way).
export async function scheduleCookReadyNotification(recipeName: string, readyAt: number): Promise<string | null> {
  if (readyAt <= Date.now()) return null;
  try {
    if (!(await ensurePermission())) return null;
    return await Notifications.scheduleNotificationAsync({
      content: { title: "요리 완성!", body: `${recipeName}, 주방에서 꺼내갈 시간이에요!` },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: readyAt, channelId: CHANNEL_ID },
    });
  } catch {
    return null;
  }
}

// Called when a pot is rushed (finished early) — its notification would otherwise still fire
// later for a dish that's already been collected.
export function cancelCookReadyNotification(id: string | undefined) {
  if (!id) return;
  Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}
