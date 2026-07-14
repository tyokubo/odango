import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function SuggestScreen() {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>認証状態を確認中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>コース提案</Text>

      <Text style={styles.description}>
        ここに、条件に合った3スポットのおでかけコースを表示します。
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>次に実装する内容</Text>
        <Text style={styles.cardText}>エリア・気分・予算を選ぶフォーム</Text>
      </View>

      <Link href="/home" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>ホームへ戻る</Text>
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
  loadingText: {
    fontSize: 16,
    color: "#555555",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: "#555555",
    marginBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#111111",
    fontWeight: "600",
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
