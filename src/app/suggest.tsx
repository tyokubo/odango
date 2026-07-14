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

const areas = ["上野", "池袋", "清澄白河", "駒込"];
const moods = ["静かに過ごしたい", "少し歩きたい", "甘いものを食べたい", "展示を見たい"];
const budgets = ["〜1,000円", "1,000〜2,000円", "2,000〜3,000円"];

const sampleSpots = [
  {
    name: "落ち着いたカフェ",
    description: "最初に立ち寄って、予定を整理する場所。",
  },
  {
    name: "小さな展示スポット",
    description: "短時間でも楽しめる、軽めの目的地。",
  },
  {
    name: "散歩できる公園",
    description: "最後に少し歩いて、気分を切り替える場所。",
  },
];

export default function SuggestScreen() {
  const { loading } = useRequireAuth();

  const [selectedArea, setSelectedArea] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSuggest = () => {
    if (!selectedArea || !selectedMood || !selectedBudget) {
      setErrorMessage("エリア、気分、予算をすべて選択してください。");
      setShowResult(false);
      return;
    }

    setErrorMessage("");
    setShowResult(true);
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
              key={budget}
              style={[
                styles.optionButton,
                selectedBudget === budget && styles.selectedOptionButton,
              ]}
              onPress={() => setSelectedBudget(budget)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedBudget === budget && styles.selectedOptionText,
                ]}
              >
                {budget}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Pressable style={styles.primaryButton} onPress={handleSuggest}>
        <Text style={styles.primaryButtonText}>3スポットを提案する</Text>
      </Pressable>

      {showResult ? (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>
            {selectedArea}で過ごす半日コース
          </Text>

          <Text style={styles.resultDescription}>
            「{selectedMood}」気分に合わせた、{selectedBudget}の仮コースです。
          </Text>

          {sampleSpots.map((spot, index) => (
            <View key={spot.name} style={styles.spotCard}>
              <Text style={styles.spotNumber}>Spot {index + 1}</Text>
              <Text style={styles.spotName}>{spot.name}</Text>
              <Text style={styles.spotDescription}>{spot.description}</Text>
            </View>
          ))}

          <Pressable style={styles.disabledButton}>
            <Text style={styles.disabledButtonText}>保存機能は次に実装</Text>
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
    marginBottom: 8,
  },
  spotDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555555",
  },
  disabledButton: {
    backgroundColor: "#eeeeee",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButtonText: {
    color: "#777777",
    fontSize: 15,
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
