import type { Spot } from "@/types/spot";

type MappableSpot = Pick<Spot, "name" | "latitude" | "longitude">;

function hasCoordinates(
  spot: MappableSpot,
): spot is MappableSpot & {
  latitude: number;
  longitude: number;
} {
  return spot.latitude !== null && spot.longitude !== null;
}

function toCoordinate(
  spot: MappableSpot & {
    latitude: number;
    longitude: number;
  },
) {
  return `${spot.latitude},${spot.longitude}`;
}

export function buildGoogleMapsRouteUrl(
  spots: MappableSpot[],
): string | null {
  const validSpots = spots.filter(hasCoordinates);

  if (validSpots.length < 2) {
    return null;
  }

  const origin = toCoordinate(validSpots[0]);
  const destination = toCoordinate(validSpots[validSpots.length - 1]);
  const middleSpots = validSpots.slice(1, -1);

  const parameters = [
    "api=1",
    `origin=${encodeURIComponent(origin)}`,
    `destination=${encodeURIComponent(destination)}`,
    "travelmode=walking",
  ];

  if (middleSpots.length > 0) {
    const waypoints = middleSpots
      .map(toCoordinate)
      .join("|");

    parameters.push(`waypoints=${encodeURIComponent(waypoints)}`);
  }

  return `https://www.google.com/maps/dir/?${parameters.join("&")}`;
}