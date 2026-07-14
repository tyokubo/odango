import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>今日はどこへ行きますか？</Text>

      <Text style={styles.description}>
        エリア、気分、予算を選んで、近場のおでかけコースを3スポットで提案します。
      </Text>

      <View style={styles.userBox}>
        <Text style={styles.userLabel}>ログイン中</Text>
        <Text style={styles.userEmail}>
          {loading ? "確認中..." : email ?? "未ログイン"}
        </Text>
      </View>

      <Link href="/suggest" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>コースを提案してもらう</Text>
        </Pressable>
      </Link>

      <Link href="/courses" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>保存済みを見る</Text>
        </Pressable>
      </Link>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>ログアウト</Text>
      </Pressable>
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
  userBox: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    backgroundColor: "#ffffff",
  },
  userLabel: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "600",
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
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#555555",
    fontSize: 15,
    fontWeight: "600",
  },
});
