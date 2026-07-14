import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/lib/supabase";

export default function CourseEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const courseId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const { loading } = useRequireAuth();

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setErrorMessage("コースIDを取得できませんでした。");
        setFetchLoading(false);
        return;
      }

      setFetchLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("courses")
        .select("id, title, memo")
        .eq("id", courseId)
        .single();

      setFetchLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setTitle(data.title ?? "");
      setMemo(data.memo ?? "");
    };

    if (!loading) {
      fetchCourse();
    }
  }, [courseId, loading]);

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage("タイトルを入力してください。");
      return;
    }

    setSaveLoading(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("courses")
      .update({
        title: title.trim(),
        memo: memo.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    setSaveLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace({
      pathname: "/courses/[id]",
      params: { id: courseId },
    });
  };

  if (loading || fetchLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>編集内容を読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>コース編集</Text>

      <Text style={styles.description}>
        保存済みコースのタイトルとメモを編集できます。
      </Text>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.form}>
        <View>
          <Text style={styles.label}>タイトル</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="コース名"
            placeholderTextColor="#999999"
          />
        </View>

        <View>
          <Text style={styles.label}>メモ</Text>
          <TextInput
            style={[styles.input, styles.memoInput]}
            value={memo}
            onChangeText={setMemo}
            placeholder="このコースについてのメモ"
            placeholderTextColor="#999999"
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[styles.primaryButton, saveLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={saveLoading}
        >
          <Text style={styles.primaryButtonText}>
            {saveLoading ? "保存中..." : "保存する"}
          </Text>
        </Pressable>

        <Link
          href={{
            pathname: "/courses/[id]",
            params: { id: courseId },
          }}
          asChild
        >
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>詳細へ戻る</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#555555",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
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
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  memoInput: {
    minHeight: 120,
  },
  errorText: {
    fontSize: 14,
    color: "#111111",
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#111111",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
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
  disabledButton: {
    opacity: 0.5,
  },
});
