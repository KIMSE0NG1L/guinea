import { useEffect } from "react";
import { Image, Modal, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { colors, fonts } from "../theme";
import { chef, kit } from "../assets";
import { GameButton } from "./GameButton";
import { NineSlice } from "./NineSlice";

// The last page: a short epilogue once every dish in the book has been tasted.
export function CookbookEnding({ onClose }: { onClose: () => void }) {
  const pop = useSharedValue(0.6);
  useEffect(() => {
    pop.value = withSequence(withTiming(1.08, { duration: 260, easing: Easing.out(Easing.back(2)) }), withTiming(1, { duration: 160 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.endingBackdrop}>
        <Animated.View style={[styles.endingPanel, popStyle]}>
          <NineSlice slice={kit.panelLarge} />
          <Image source={chef.cheer} style={styles.endingImage} />
          <Text style={styles.endingEyebrow}>세상의 모든 맛</Text>
          <Text style={styles.endingTitle}>마지막 장을 덮다</Text>
          <Text style={styles.endingText}>
            {"마지막 페이지의 요리를 한 입 맛본 기니는\n천천히 낡은 요리책을 덮었다.\n\n건초만 씹던 날들이 아득하게 느껴졌다.\n뒷산의 젤리부터 여우 신사의 연회까지,\n책 속의 맛은 이제 전부 기니의 것이다.\n\n이번엔 할머니께 이 맛들을 대접할 차례.\n기니의 다음 여행이 시작된다."}
          </Text>
          <GameButton variant="green" onPress={onClose} style={styles.endingButton}>
            책을 덮는다
          </GameButton>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  endingBackdrop: { flex: 1, justifyContent: "center", paddingHorizontal: 18, backgroundColor: "#263024e6" },
  endingPanel: { alignItems: "center", paddingHorizontal: 22, paddingTop: 20, paddingBottom: 20 },
  endingImage: { width: 110, height: 110 },
  endingEyebrow: { marginTop: 4, color: colors.green, fontSize: 9, fontWeight: "900", fontFamily: fonts.bold, letterSpacing: 1.5 },
  endingTitle: { marginTop: 2, fontSize: 20, fontWeight: "900", fontFamily: fonts.bold, color: colors.ink },
  endingText: { marginTop: 10, fontSize: 11, lineHeight: 17, color: colors.ink, textAlign: "center" },
  endingButton: { marginTop: 16, minWidth: 140 },
});
