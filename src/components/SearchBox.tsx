import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts } from "../theme";

// A one-line search field for ingredient / dish lists, with a clear button once typed in.
export function SearchBox({
  value,
  onChange,
  placeholder,
  resultCount,
}: {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  // Shown after typing, so an empty result reads as "nothing found" rather than a bug.
  resultCount?: number;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.box}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel={placeholder}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChange("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="검색어 지우기" style={styles.clear}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>
      {value.length > 0 && resultCount !== undefined && (
        <Text style={styles.result}>{resultCount > 0 ? `${resultCount}개 찾음` : "찾는 게 없어요. 다른 이름이나 초성(예: ㄸㅂㅇ)으로 찾아보세요."}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 10 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 38,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.cream,
  },
  icon: { fontSize: 14, marginRight: 6 },
  input: { flex: 1, paddingVertical: 0, fontSize: 13, fontFamily: fonts.bold, color: colors.ink },
  clear: { marginLeft: 6, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.muted },
  clearText: { fontSize: 11, fontWeight: "900", color: colors.cream },
  result: { marginTop: 5, marginLeft: 4, fontSize: 11, fontWeight: "800", fontFamily: fonts.bold, color: colors.brown },
});
