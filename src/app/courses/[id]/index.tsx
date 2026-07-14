import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/lib/supabase";
import type { Course } from "@/types/course";

export default function CourseDetailScreen() {
  const params = useLocalSearchParams();
  const courseId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const { loading } = useRequireAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
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
        .select(
          `
          id,
          title,
          area,
          mood,
          budget_label,
          memo,
          created_at,
          course_spots (
            id,
            position,
            note,
            spots (
              id,
              name,
              area,
              mood,
              category,
              description,
              budget_min,
              budget_max,
              google_maps_url,
              created_at
            )
          )
        `
        )
        .eq("id", courseId)
        .single();

      setFetchLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const formattedCourse = {
        ...(data as Course),
        course_spots: [...(data as Course).course_spots].sort(
          (a, b) => a.position - b.position
        ),
      };

      setCourse(formattedCourse);
    };

    if (!loading) {
      fetchCourse();
    }
  }, [courseId, loading]);

  if (loading || fetchLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>コース詳細を読み込み中...</Text>
      </View>
    );
  }

  if (errorMessage || !course) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>コースを表示できません</Text>
        <Text style={styles.description}>
          {errorMessage || "コースが見つかりませんでした。"}
        </Text>

        <Link href="/courses" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>一覧へ戻る</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{course.title}</Text>

      <Text style={styles.description}>
        保存した3スポットの詳細を確認できます。
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>条件</Text>
        <Text style={styles.infoText}>
          {course.area} / {course.mood} / {course.budget_label}
        </Text>
      </View>

      <View style={styles.spotList}>
        {course.course_spots.map((courseSpot) => (
          <View key={courseSpot.id} style={styles.spotCard}>
            <Text style={styles.spotNumber}>Spot {courseSpot.position}</Text>

            <Text style={styles.spotName}>{courseSpot.spots.name}</Text>

            <Text style={styles.spotCategory}>
              {courseSpot.spots.category}
            </Text>

            <Text style={styles.spotDescription}>
              {courseSpot.spots.description}
            </Text>

            <Text style={styles.spotBudget}>
              目安：{courseSpot.spots.budget_min.toLocaleString()}〜
              {courseSpot.spots.budget_max.toLocaleString()}円
            </Text>
          </View>
        ))}
      </View>

      <Link href="/courses" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>一覧へ戻る</Text>
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
    marginBottom: 28,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
  },
  infoLabel: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#111111",
    fontWeight: "600",
  },
  spotList: {
    gap: 16,
    marginBottom: 28,
  },
  spotCard: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  spotNumber: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 8,
  },
  spotName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 6,
  },
  spotCategory: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 10,
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
