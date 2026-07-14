import { Link } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/lib/supabase";
import type { Spot } from "@/types/spot";

const areas = ["上野", "池袋", "清澄白河", "駒込"];
const moods = ["静かに過ごしたい", "少し歩きたい", "甘いものを食べたい", "展示を見たい"];

const budgets = [
  { label: "〜1,000円", max: 1000 },
  { label: "1,000〜2,000円", max: 2000 },
  { label: "2,000〜3,000円", max: 3000 },
];

export default function SuggestScreen() {
  const { user, loading } = useRequireAuth();

  const [selectedArea, setSelectedArea] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [spots, setSpots] = useState<Spot[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resultLoading, setResultLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleSuggest = async () => {
    if (!selectedArea || !selectedMood || !selectedBudget) {
      setErrorMessage("エリア、気分、予算をすべて選択してください。");
      setSuccessMessage("");
      setSpots([]);
      return;
    }

    const budget = budgets.find((item) => item.label === selectedBudget);

    if (!budget) {
      setErrorMessage("予算の選択が正しくありません。");
      setSuccessMessage("");
      setSpots([]);
      return;
    }

    setResultLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setSpots([]);

    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .eq("area", selectedArea)
      .lte("budget_min", budget.max);

    setResultLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const sortedSpots = ((data ?? []) as Spot[])
      .sort((a, b) => {
        const aMatchesMood = a.mood === selectedMood ? 1 : 0;
        const bMatchesMood = b.mood === selectedMood ? 1 : 0;

        return bMatchesMood - aMatchesMood;
      })
      .slice(0, 3);

    if (sortedSpots.length < 3) {
      setErrorMessage("条件に合うスポットが不足しています。条件を変えてください。");
      setSpots([]);
      return;
    }

    setSpots(sortedSpots);
  };

  const handleSaveCourse = async () => {
    if (!user) {
      setErrorMessage("ログイン状態を確認できませんでした。もう一度ログインしてください。");
      return;
    }

    if (spots.length !== 3) {
      setErrorMessage("保存するには、先に3スポットを提案してください。");
      return;
    }

    setSaveLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const title = `${selectedArea}で過ごす半日コース`;

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        user_id: user.id,
        title,
        area: selectedArea,
        mood: selectedMood,
        budget_label: selectedBudget,
        memo: null,
      })
      .select("id")
      .single();

    if (courseError) {
      setSaveLoading(false);
      setErrorMessage(courseError.message);
      return;
    }

    const courseSpotRows = spots.map((spot, index) => ({
      course_id: course.id,
      spot_id: spot.id,
      position: index + 1,
      note: null,
    }));

    const { error: courseSpotsError } = await supabase
      .from("course_spots")
      .insert(courseSpotRows);

    setSaveLoading(false);

    if (courseSpotsError) {
      setErrorMessage(courseSpotsError.message);
      return;
    }

    setSuccessMessage("コースを保存しました。");
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>認証状態を確認中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>コース提案</Text>

      <Text style={styles.description}>
        エリア、気分、予算を選んで、近場のおでかけコースを3スポットで提案します。
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>エリア</Text>
        <View style={styles.optionGroup}>
          {areas.map((area) => (
            <Pressable
              key={area}
              style={[
                styles.optionButton,
                selectedArea === area && styles.selectedOptionButton,
              ]}
              onPress={() => setSelectedArea(area)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedArea === area && styles.selectedOptionText,
                ]}
              >
                {area}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>気分</Text>
        <View style={styles.optionGroup}>
          {moods.map((mood) => (
            <Pressable
              key={mood}
              style={[
                styles.optionButton,
                selectedMood === mood && styles.selectedOptionButton,
              ]}
              onPress={() => setSelectedMood(mood)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedMood === mood && styles.selectedOptionText,
                ]}
              >
                {mood}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>予算</Text>
        <View style={styles.optionGroup}>
          {budgets.map((budget) => (
            <Pressable
              key={budget.label}
              style={[
                styles.optionButton,
                selectedBudget === budget.label && styles.selectedOptionButton,
              ]}
              onPress={() => setSelectedBudget(budget.label)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedBudget === budget.label && styles.selectedOptionText,
                ]}
              >
                {budget.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <Pressable style={styles.primaryButton} onPress={handleSuggest}>
        <Text style={styles.primaryButtonText}>
          {resultLoading ? "提案中..." : "3スポットを提案する"}
        </Text>
      </Pressable>

      {spots.length > 0 ? (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>
            {selectedArea}で過ごす半日コース
          </Text>

          <Text style={styles.resultDescription}>
            「{selectedMood}」気分に合わせた、{selectedBudget}のコースです。
          </Text>

          {spots.map((spot, index) => (
            <View key={spot.id} style={styles.spotCard}>
              <Text style={styles.spotNumber}>Spot {index + 1}</Text>
              <Text style={styles.spotName}>{spot.name}</Text>
              <Text style={styles.spotCategory}>{spot.category}</Text>
              <Text style={styles.spotDescription}>{spot.description}</Text>
              <Text style={styles.spotBudget}>
                目安：{spot.budget_min.toLocaleString()}〜{spot.budget_max.toLocaleString()}円
              </Text>
            </View>
          ))}

          <Pressable
            style={[styles.saveButton, saveLoading && styles.disabledButton]}
            onPress={handleSaveCourse}
            disabled={saveLoading}
          >
            <Text style={styles.saveButtonText}>
              {saveLoading ? "保存中..." : "このコースを保存する"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Link href="/home" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>ホームへ戻る</Text>
        </Pressable>
      </Link>
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 12,
  },
  optionGroup: {
    gap: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  selectedOptionButton: {
    borderColor: "#111111",
    backgroundColor: "#111111",
  },
  optionText: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "600",
  },
  selectedOptionText: {
    color: "#ffffff",
  },
  errorText: {
    fontSize: 14,
    color: "#111111",
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    color: "#111111",
    backgroundColor: "#eeeeee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#111111",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 28,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  resultSection: {
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 28,
    marginBottom: 28,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 10,
  },
  resultDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555555",
    marginBottom: 20,
  },
  spotCard: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  spotNumber: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 8,
  },
  spotName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 6,
  },
  spotCategory: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 8,
  },
  spotDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555555",
    marginBottom: 10,
  },
  spotBudget: {
    fontSize: 13,
    color: "#555555",
  },
  saveButton: {
    backgroundColor: "#111111",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
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
