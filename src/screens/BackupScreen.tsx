import { useState } from "react";
import { Platform, Share, StyleSheet, TextInput, View } from "react-native";
import { Text } from "../components/GameText";
import { colors, fonts } from "../theme";
import { kit } from "../assets";
import { Panel } from "../components/NineSlice";
import { PageHeading } from "../components/PageHeading";
import { GameButton } from "../components/GameButton";
import { ConfirmModal } from "../components/ConfirmModal";
import { decodeBackup, encodeBackup } from "../state/backup";
import { formatGameNumber } from "../state/gameMath";
import { STAGES } from "../state/stages";
import type { GameState } from "../types";
import { t } from "../i18n";

// Composes "N AreaName" without going through stages.ts's getStageLabel, so the area name
// can be run through t() for English — stages.ts itself stays untouched/Korean-only.
const stageLabel = (stageNumber: number) => `${stageNumber + 1} ${t(STAGES[Math.min(stageNumber, STAGES.length - 1)].area)}`;

// 세이브 백업: the save as a code to keep (sent to yourself in a chat or a memo), and a box to
// paste one back — which replaces this device's game entirely, after a confirm.
export function BackupScreen({ state, onRestore }: { state: GameState; onRestore: (state: GameState) => void }) {
  const [code] = useState(() => encodeBackup(state));
  const [notice, setNotice] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<GameState | null>(null);

  const share = async () => {
    // The web has no share sheet everywhere — copy instead.
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(code);
        setNotice(t("백업 코드를 복사했어요. 메모장이나 채팅에 붙여 넣어 보관하세요.", "Copied the backup code. Paste it into a note or chat to keep it."));
        return;
      } catch {
        setNotice(t("복사하지 못했어요. 아래 코드를 직접 선택해서 복사해 주세요.", "Couldn't copy it. Please select the code below and copy it yourself."));
        return;
      }
    }
    try {
      await Share.share({ message: code });
    } catch {
      setNotice(t("공유하지 못했어요. 아래 코드를 직접 선택해서 복사해 주세요.", "Couldn't share it. Please select the code below and copy it yourself."));
    }
  };

  const check = () => {
    const result = decodeBackup(input);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setError(null);
    setPending(result.state);
  };

  return (
    <View style={styles.page}>
      <PageHeading
        kicker="BACKUP"
        title={t("세이브 백업", "Save Backup")}
        description={t("기기를 바꾸거나 앱을 지우기 전에 꼭 챙겨 두세요.", "Be sure to grab this before switching devices or deleting the app.")}
      />

      <Panel slice={kit.panel} style={styles.card}>
        <Text style={styles.cardTitle}>{t("백업 코드 만들기", "Create a Backup Code")}</Text>
        <Text style={styles.cardText}>
          {t(
            `지금 진행 상황(Lv.${formatGameNumber(state.level)} · ${stageLabel(state.stageNumber)})이 담긴 코드예요. 나에게 보내는 채팅이나 메모에 보관하세요.`,
            `A code holding your current progress (Lv.${formatGameNumber(state.level)} · ${stageLabel(state.stageNumber)}). Keep it in a note or a chat to yourself.`,
          )}
        </Text>
        <TextInput value={code} editable={false} multiline selectTextOnFocus style={[styles.codeBox, styles.codeBoxShown]} />
        <GameButton variant="green" onPress={share} style={styles.button}>
          {Platform.OS === "web" ? t("코드 복사하기", "Copy Code") : t("코드 공유하기", "Share Code")}
        </GameButton>
        {notice && <Text style={styles.notice}>{notice}</Text>}
      </Panel>

      <Panel slice={kit.panel} style={styles.card}>
        <Text style={styles.cardTitle}>{t("백업 코드로 불러오기", "Restore from a Backup Code")}</Text>
        <Text style={styles.cardText}>
          {t(
            "보관해 둔 코드를 붙여 넣으면 그 시점의 진행 상황으로 바뀌어요. 지금 이 기기의 진행 상황은 사라져요.",
            "Paste in a code you saved to switch to that progress. This device's current progress will be lost.",
          )}
        </Text>
        <TextInput
          value={input}
          onChangeText={(text) => {
            setInput(text);
            setError(null);
          }}
          placeholder={t("GINI1.로 시작하는 백업 코드", "Backup code starting with GINI1.")}
          placeholderTextColor="#a8957a"
          multiline
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.codeBox}
        />
        <GameButton variant={input.trim() ? "beige" : "gray"} disabled={!input.trim()} onPress={check} style={styles.button}>
          {t("불러오기", "Restore")}
        </GameButton>
        {error && <Text style={styles.error}>{error}</Text>}
      </Panel>

      {pending && (
        <ConfirmModal
          title={t("세이브 불러오기", "Restore Save")}
          message={t(
            `Lv.${formatGameNumber(pending.level)} · ${stageLabel(pending.stageNumber)} 진행 상황으로 바꿀까요? 지금 이 기기의 진행 상황은 사라지고 되돌릴 수 없어요.`,
            `Switch to the progress at Lv.${formatGameNumber(pending.level)} · ${stageLabel(pending.stageNumber)}? This device's current progress will be lost and can't be undone.`,
          )}
          confirmLabel={t("불러오기", "Restore")}
          onConfirm={() => {
            const next = pending;
            setPending(null);
            onRestore(next);
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 25, gap: 12 },
  card: { paddingHorizontal: 18, paddingTop: 15, paddingBottom: 17 },
  cardTitle: { fontSize: 16, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  cardText: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 4, fontSize: 12, color: colors.brown, lineHeight: 16 },
  codeBox: {
    marginTop: 10,
    minHeight: 70,
    maxHeight: 110,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#c9a978",
    backgroundColor: "#fff8e6",
    color: colors.ink,
    fontSize: 14,
    textAlignVertical: "top",
  },
  codeBoxShown: { color: colors.brown },
  button: { marginTop: 10, alignSelf: "center", minWidth: 160 },
  notice: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 8, fontSize: 12, lineHeight: 16, color: colors.green, textAlign: "center" },
  error: { fontFamily: fonts.light, letterSpacing: -0.36, marginTop: 8, fontSize: 12, lineHeight: 16, color: colors.red, textAlign: "center" },
});
