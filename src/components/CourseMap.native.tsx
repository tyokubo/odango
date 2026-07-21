import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import type { CourseSpot } from "@/types/course";

type CourseMapProps = {
  courseSpots: CourseSpot[];
};

export function CourseMap({ courseSpots }: CourseMapProps) {
  const mapRef = useRef<MapView | null>(null);

  const points = [...courseSpots]
    .sort((a, b) => a.position - b.position)
    .flatMap((courseSpot) => {
      const spot = courseSpot.spots;

      if (spot.latitude === null || spot.longitude === null) {
        return [];
      }

      return [
        {
          id: courseSpot.id,
          position: courseSpot.position,
          name: spot.name,
          category: spot.category,
          latitude: spot.latitude,
          longitude: spot.longitude,
        },
      ];
    });

  if (points.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          地図を表示するための位置情報がありません。
        </Text>
      </View>
    );
  }

  const coordinates = points.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
  }));

  const fitAllPoints = () => {
    if (coordinates.length === 1) {
      mapRef.current?.animateToRegion(
        {
          latitude: coordinates[0].latitude,
          longitude: coordinates[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      );

      return;
    }

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: {
        top: 64,
        right: 64,
        bottom: 64,
        left: 64,
      },
      animated: false,
    });
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: points[0].latitude,
        longitude: points[0].longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }}
      onMapReady={fitAllPoints}
    >
      {points.map((point) => (
        <Marker
          key={point.id}
          coordinate={{
            latitude: point.latitude,
            longitude: point.longitude,
          }}
          title={`${point.position}. ${point.name}`}
          description={point.category}
        />
      ))}

      {coordinates.length >= 2 ? (
        <Polyline
          coordinates={coordinates}
          strokeWidth={3}
          strokeColor="#111111"
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555555",
    textAlign: "center",
  },
});