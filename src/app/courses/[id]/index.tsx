import * as Linking from "expo-linking";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "@/components/AppButton";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { buildGoogleMapsRouteUrl } from "@/lib/googleMaps";
import { supabase } from "@/lib/supabase";
import type { Course } from "@/types/course";

export default function CourseDetailScreen() {
  const router = useRouter();
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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
              latitude,
              longitude,
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

      const parsedCourse = data as unknown as Course;

      const formattedCourse: Course = {
        ...parsedCourse,
        course_spots: [...parsedCourse.course_spots].sort(
          (a, b) => a.position - b.position
        ),
      };

      setCourse(formattedCourse);

      setCourse(formattedCourse);
    };

    if (!loading) {
      fetchCourse();
    }
  }, [courseId, loading]);

  const handleDeleteCourse = async () => {
    if (!courseId) {
      setErrorMessage("削除するコースIDを取得できませんでした。");
      return;
    }

    setDeleteLoading(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    setDeleteLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/courses");
  };

  const handleOpenGoogleMaps = async () => {
    if (!course) {
      return;
    }

    const orderedSpots = [...course.course_spots]
      .sort((a, b) => a.position - b.position)
      .map((courseSpot) => courseSpot.spots);

    const routeUrl = buildGoogleMapsRouteUrl(orderedSpots);

    if (!routeUrl) {
      setErrorMessage(
        "ルートを表示するための位置情報が不足しています。"
      );
      return;
    }

    setErrorMessage("");

    try {
      await Linking.openURL(routeUrl);
    } catch {
      setErrorMessage("Google Mapsを開けませんでした。");
    }
  };

  if (loading || fetchLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>コース詳細を読み込み中...</Text>
      </View>
    );
  }

  if (errorMessage && !course) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>コースを表示できません</Text>
        <Text style={styles.description}>{errorMessage}</Text>

        <Link href="/courses" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>一覧へ戻る</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>コースが見つかりません</Text>
        <Text style={styles.description}>
          削除済み、またはアクセス権限のないコースです。
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

      {course.memo ? (
        <View style={styles.memoBox}>
          <Text style={styles.memoLabel}>メモ</Text>
          <Text style={styles.memoText}>{course.memo}</Text>
        </View>
      ) : null}

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

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

      <View style={styles.mapButtonContainer}>
        <AppButton
          title="Google Mapsでルートを見る"
          onPress={handleOpenGoogleMaps}
        />
      </View>
      <Link
        href={{
          pathname: "/courses/[id]/edit",
          params: { id: courseId },
        }}
        asChild
      >
        <Pressable style={styles.editButton}>
          <Text style={styles.editButtonText}>編集する</Text>
        </Pressable>
      </Link>

      {showDeleteConfirm ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>このコースを削除しますか？</Text>
          <Text style={styles.confirmText}>
            削除すると、このコースとスポットの並びは元に戻せません。
          </Text>

          <Pressable
            style={[styles.deleteConfirmButton, deleteLoading && styles.disabledButton]}
            onPress={handleDeleteCourse}
            disabled={deleteLoading}
          >
            <Text style={styles.deleteConfirmButtonText}>
              {deleteLoading ? "削除中..." : "削除する"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => setShowDeleteConfirm(false)}
            disabled={deleteLoading}
          >
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.deleteButton}
          onPress={() => setShowDeleteConfirm(true)}
        >
          <Text style={styles.deleteButtonText}>このコースを削除する</Text>
        </Pressable>
      )}

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
  memoBox: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    backgroundColor: "#ffffff",
  },
  memoLabel: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 8,
  },
  memoText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#111111",
  },
  errorText: {
    fontSize: 14,
    color: "#111111",
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
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
  confirmBox: {
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555555",
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: "#111111",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#dddddd",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  deleteButtonText: {
    color: "#555555",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteConfirmButton: {
    backgroundColor: "#111111",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  deleteConfirmButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#111111",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#111111",
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
  mapButtonContainer: {
    marginBottom: 12,
  },
});
