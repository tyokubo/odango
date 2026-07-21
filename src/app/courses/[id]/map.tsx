import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { CourseMap } from "@/components/CourseMap";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/lib/supabase";
import type { Course } from "@/types/course";

export default function CourseMapScreen() {
  const params = useLocalSearchParams();

  const courseId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const { loading: authLoading } = useRequireAuth();

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
        .select(`
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
        `)
        .eq("id", courseId)
        .single();

      setFetchLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const parsedCourse = data as unknown as Course;

      setCourse({
        ...parsedCourse,
        course_spots: [...parsedCourse.course_spots].sort(
          (a, b) => a.position - b.position
        ),
      });
    };

    if (!authLoading) {
      fetchCourse();
    }
  }, [authLoading, courseId]);

  if (authLoading || fetchLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>
          地図を読み込み中...
        </Text>
      </View>
    );
  }

  if (errorMessage || !course) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          地図を表示できません
        </Text>

        <Text style={styles.errorText}>
          {errorMessage || "コースが見つかりませんでした。"}
        </Text>

        <Link
          href={{
            pathname: "/courses/[id]",
            params: { id: courseId },
          }}
          asChild
        >
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>
              コース詳細へ戻る
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{course.title}</Text>

        <Text style={styles.description}>
          3スポットの位置関係
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <CourseMap courseSpots={course.course_spots} />
      </View>

      <Link
        href={{
          pathname: "/courses/[id]",
          params: { id: course.id },
        }}
        asChild
      >
        <Pressable style={styles.footerButton}>
          <Text style={styles.footerButtonText}>
            コース詳細へ戻る
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111111",
  },
  description: {
    fontSize: 15,
    color: "#666666",
  },
  mapContainer: {
    flex: 1,
    minHeight: 360,
  },
  footerButton: {
    marginHorizontal: 24,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "#ffffff",
  },
  loadingText: {
    fontSize: 15,
    color: "#555555",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
  },
  errorText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555555",
    textAlign: "center",
  },
  backButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },
});