import { useState } from "react";
import { Image, Modal, StyleSheet, View } from "react-native";
import { Text } from "./GameText";
import { colors, fonts } from "../theme";
import { creamSlices, panelSlices, uiImages } from "../assets";
import { NineSlice, Panel } from "./NineSlice";
import { GameButton } from "./GameButton";
import { StrokedText } from "./StrokedText";
import { CharacterSprite } from "./CharacterSprite";
import { LATEST_UPDATE } from "../state/updates";
import { t } from "../i18n";

const FRAME = panelSlices.redRibbon;

// 업데이트 소식: the latest update's list. `gift`: the first time a player sees this update,
// its gems come with the close button; reopened from the settings it's just the list.
// The red-ribbon wood frame carries the heading on its ribbon; each new thing is a plain
// cream row (icon first, text beside it) inside it.
export function WhatsNewModal({ gift, onClose }: { gift: boolean; onClose: () => void }) {
  const [width, setWidth] = useState(0);
  // The frame is drawn at its source width's scale, so its padding scales with it too.
  const scale = width / FRAME.width;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[styles.panel, width > 0 && { paddingTop: 96 * scale, paddingHorizontal: 30 * scale + 10, paddingBottom: 30 * scale + 14 }]}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        >
          {width > 0 && (
            <>
              <NineSlice slice={FRAME} scale={scale} />
              {/* The ribbon's flat middle, between its folded tails. */}
              <View style={[styles.ribbon, { top: 12 * scale, height: 44 * scale }]} pointerEvents="none">
                <StrokedText style={styles.ribbonText} strokeColor="#7a2414" strokeWidth={2}>
                  {t("업데이트 소식", "What's New")}
                </StrokedText>
              </View>
            </>
          )}
          <Text style={styles.title}>{t(LATEST_UPDATE.title)}</Text>
          <View style={styles.list}>
            {LATEST_UPDATE.items.map((item) => (
              <Panel key={item.text} slice={creamSlices.row} scale={0.28} style={styles.item}>
                <View style={styles.iconBox}>
                  {item.outfit ? (
                    <CharacterSprite outfit={item.outfit} animation="idle" size={46} />
                  ) : (
                    <Image source={item.image} style={styles.icon} />
                  )}
                </View>
                <Text style={styles.text}>{t(item.text)}</Text>
              </Panel>
            ))}
          </View>
          <GameButton variant="green" onPress={onClose} style={styles.button}>
            {gift ? (
              // The gems are the point: a big gem bursting out of the button and a bold count.
              <View style={styles.gift}>
                <Text style={styles.giftText}>{t("업데이트 보상", "Update Reward")}</Text>
                <Image source={uiImages.crystal} style={styles.gem} />
                <StrokedText style={styles.giftAmount} strokeColor="#2f4a1c" strokeWidth={2}>
                  {`×${LATEST_UPDATE.gems}`}
                </StrokedText>
              </View>
            ) : (
              t("닫기", "Close")
            )}
          </GameButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: 18, justifyContent: "center", backgroundColor: "#263024cf" },
  panel: { width: "100%", maxWidth: 400, alignSelf: "center", alignItems: "center" },
  ribbon: { position: "absolute", left: "18%", right: "18%", alignItems: "center", justifyContent: "center" },
  ribbonText: { fontSize: 20, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream },
  title: { fontSize: 20, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  list: { marginTop: 14, alignSelf: "stretch", gap: 6 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingLeft: 10, paddingRight: 14, minHeight: 56 },
  iconBox: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  icon: { width: 36, height: 36, resizeMode: "contain" },
  text: { flex: 1, fontSize: 14, lineHeight: 18, color: colors.ink, fontWeight: "800", fontFamily: fonts.bold },
  button: { marginTop: 18, minWidth: 210, minHeight: 46 },
  gift: { flexDirection: "row", alignItems: "center", gap: 2 },
  giftText: { fontSize: 15, fontWeight: "900", fontFamily: fonts.bold, color: colors.cream, marginRight: 6 },
  // Bigger than the button is tall, so it pokes out above and below.
  gem: { width: 40, height: 40, marginVertical: -10, resizeMode: "contain" },
  giftAmount: { fontSize: 22, fontWeight: "900", fontFamily: fonts.bold, color: "#fff4b8" },
});
