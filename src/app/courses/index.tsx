import { Link } from "expo-router";
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
import * as Linking from "expo-linking";

import { AppButton } from "@/components/AppButton";
import { buildGoogleMapsRouteUrl } from "@/lib/googleMaps";

export default function CoursesScreen() {
  const { loading } = useRequireAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
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
              latitude,
              longitude,
              created_at
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      setFetchLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const formattedCourses = ((data ?? []) as unknown as Course[]).map(
        (course) => ({
          ...course,
          course_spots: [...course.course_spots].sort(
            (a, b) => a.position - b.position
          ),
        })
      );

      setCourses(formattedCourses);
    };

    if (!loading) {
      fetchCourses();
    }
  }, [loading]);

  if (loading || fetchLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>保存済みコースを読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>保存済みコース</Text>

      <Text style={styles.description}>
        保存したおでかけコースを一覧で確認できます。
      </Text>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {courses.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>まだ保存済みコースがありません</Text>
          <Text style={styles.emptyText}>
            コース提案画面で3スポットを提案し、保存してみてください。
          </Text>
        </View>
      ) : (
        <View style={styles.courseList}>
          {courses.map((course) => (
            <View key={course.id} style={styles.courseCard}>
              <Text style={styles.courseTitle}>{course.title}</Text>

              <Text style={styles.courseMeta}>
                {course.area} / {course.mood} / {course.budget_label}
              </Text>

              <View style={styles.spotList}>
                {course.course_spots.map((courseSpot) => (
                  <View key={courseSpot.id} style={styles.spotRow}>
                    <Text style={styles.spotPosition}>
                      {courseSpot.position}
                    </Text>

                    <View style={styles.spotTextBox}>
                      <Text style={styles.spotName}>
                        {courseSpot.spots.name}
                      </Text>
                      <Text style={styles.spotCategory}>
                        {courseSpot.spots.category}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <Link
                href={{
                  pathname: "/courses/[id]",
                  params: { id: course.id },
                }}
                asChild
              >
                <Pressable style={styles.detailButton}>
                  <Text style={styles.detailButtonText}>詳細を見る</Text>
                </Pressable>
              </Link>
            </View>
          ))}
        </View>
      )}

      <Link href="/suggest" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>新しく提案する</Text>
        </Pressable>
      </Link>

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
  errorText: {
    fontSize: 14,
    color: "#111111",
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555555",
  },
  courseList: {
    gap: 16,
    marginBottom: 28,
  },
  courseCard: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  courseTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  courseMeta: {
    fontSize: 13,
    lineHeight: 20,
    color: "#666666",
    marginBottom: 16,
  },
  spotList: {
    gap: 10,
    marginBottom: 16,
  },
  spotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  spotPosition: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#111111",
    textAlign: "center",
    lineHeight: 26,
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
  },
  spotTextBox: {
    flex: 1,
  },
  spotName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 2,
  },
  spotCategory: {
    fontSize: 12,
    color: "#777777",
  },
  detailButton: {
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
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
