import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { PageHeading } from "../components/PageHeading";
import type { GameState } from "../types";

export function CompanionsScreen({ companions }: { companions: GameState["companions"] }) {
  return (
    <View style={styles.page}>
      <PageHeading kicker="FRIENDS" title="동료" description="혼자보다 덜 쓸쓸하고, 조금 더 세다." />
      <View style={styles.list}>
        {companions.map((companion, index) => (
          <View style={styles.card} key={companion.name}>
            <View style={styles.lockedAvatar}>
              <View style={styles.lockShackle} />
              <View style={styles.lockBody} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardSmall}>동료 슬롯 {index + 1}</Text>
              <Text style={styles.cardStrong}>{companion.unlocked ? companion.name : "아직은 비밀"}</Text>
              <Text style={styles.cardSpan}>스테이지 {index + 2}-1에서 발견</Text>
            </View>
            <View style={styles.lockedTag}>
              <Text style={styles.lockedTagText}>잠김</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#e8dcc4", paddingHorizontal: 12, paddingTop: 18, paddingBottom: 25 },
  list: { gap: 10 },
  card: {
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderColor: colors.line,
    borderRadius: 13,
  },
  lockedAvatar: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#c6bdac",
    borderWidth: 2,
    borderColor: "#807564",
    borderStyle: "dashed",
    borderRadius: 32,
  },
  lockShackle: {
    position: "absolute",
    top: 15,
    width: 12,
    height: 14,
    borderWidth: 4,
    borderColor: "#73695b",
    borderBottomWidth: 0,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  lockBody: { width: 20, height: 17, backgroundColor: "#73695b", borderRadius: 3 },
  cardCopy: { flex: 1 },
  cardSmall: { color: colors.brown, fontSize: 8 },
  cardStrong: { marginVertical: 2, fontSize: 13, fontWeight: "800", fontFamily: fonts.bold, color: colors.ink },
  cardSpan: { color: colors.muted, fontSize: 9 },
  lockedTag: { paddingVertical: 5, paddingHorizontal: 7, backgroundColor: "#80776b", borderRadius: 6 },
  lockedTagText: { color: "white", fontSize: 8, fontWeight: "900", fontFamily: fonts.bold },
});
