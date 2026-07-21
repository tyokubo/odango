import * as Linking from "expo-linking";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { buildGoogleMapsRouteUrl } from "@/lib/googleMaps";
import type { CourseSpot } from "@/types/course";

type CourseMapProps = {
  courseSpots: CourseSpot[];
};

export function CourseMap({ courseSpots }: CourseMapProps) {
  const spots = [...courseSpots]
    .sort((a, b) => a.position - b.position)
    .map((courseSpot) => courseSpot.spots);

  const routeUrl = buildGoogleMapsRouteUrl(spots);

  const handleOpenGoogleMaps = async () => {
    if (!routeUrl) {
      return;
    }

    await Linking.openURL(routeUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>3スポットの位置関係</Text>

      <Text style={styles.description}>
        Web版では、Google Mapsを別画面で開いて位置関係を確認できます。
      </Text>

      {routeUrl ? (
        <AppButton
          title="Google Mapsでルートを見る"
          onPress={handleOpenGoogleMaps}
        />
      ) : (
        <Text style={styles.errorText}>
          地図を表示するための位置情報が不足しています。
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111111",
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555555",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555555",
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
  },
});