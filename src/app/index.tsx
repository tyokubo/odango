import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Odango</Text>

      <Text style={styles.title}>近場のおでかけを、3スポットで決める</Text>

      <Text style={styles.description}>
        休日や空き時間に行けるおでかけコースを提案・保存できるアプリです。
      </Text>

      <Link href="/login" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>ログインする</Text>
        </Pressable>
      </Link>

      <Link href="/signup" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>新規登録する</Text>
        </Pressable>
      </Link>
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
  primaryButton: {
    backgroundColor: "#111111",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#111111",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },
});
