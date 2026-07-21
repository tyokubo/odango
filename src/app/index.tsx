import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";

export default function IndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Odango</Text>

      <Text style={styles.title}>近場のおでかけを、3スポットで決める</Text>

      <Text style={styles.description}>
        休日や空き時間に行けるおでかけコースを提案・保存できるアプリです。
      </Text>

      <View style={styles.buttonGroup}>
        <AppButton title="ログインする" onPress={() => router.push("/login")} />
        <AppButton
          title="新規登録する"
          variant="secondary"
          onPress={() => router.push("/signup")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  appName: {
    fontSize: 40,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 34,
    color: "#111111",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: "#555555",
    marginBottom: 40,
  },
  buttonGroup: {
    gap: 12,
  },
});
