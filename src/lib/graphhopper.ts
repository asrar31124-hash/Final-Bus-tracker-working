const GRAPHHOPPER_API_KEY = import.meta.env.VITE_GRAPHHOPPER_API_KEY || "";
const GRAPHHOPPER_BASE_URL = "https://graphhopper.com/api/1";

export interface RoutingRequest {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  vehicle?: "car" | "bike" | "foot" | "hike" | "scooter";
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteResult {
  distance: number; // in meters
  time: number; // in milliseconds
  points: RoutePoint[];
}

export async function getRoute({
  fromLat,
  fromLng,
  toLat,
  toLng,
  vehicle = "car",
}: RoutingRequest): Promise<RouteResult | null> {
  try {
    const url = new URL(`${GRAPHHOPPER_BASE_URL}/route`);
    url.searchParams.append("point", `${fromLat},${fromLng}`);
    url.searchParams.append("point", `${toLat},${toLng}`);
    url.searchParams.set("vehicle", vehicle);
    url.searchParams.set("key", GRAPHHOPPER_API_KEY);
    url.searchParams.set("profile", vehicle);
    url.searchParams.set("calc_points", "true");
    url.searchParams.set("points_encoded", "false");

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("GraphHopper API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    if (!data.paths || data.paths.length === 0) {
      return null;
    }

    const path = data.paths[0];
    const points: RoutePoint[] = path.points.coordinates.map((coord: [number, number]) => ({
      lat: coord[1],
      lng: coord[0],
    }));

    return {
      distance: path.distance,
      time: path.time,
      points,
    };
  } catch (err) {
    console.error("Error getting route from GraphHopper:", err);
    return null;
  }
}

export async function geocode(query: string): Promise<RoutePoint | null> {
  try {
    const url = new URL(`${GRAPHHOPPER_BASE_URL}/geocode`);
    url.searchParams.set("q", query);
    url.searchParams.set("key", GRAPHHOPPER_API_KEY);
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("GraphHopper Geocoding error:", response.statusText);
      return null;
    }

    const data = await response.json();
    if (!data.hits || data.hits.length === 0) {
      return null;
    }

    return {
      lat: data.hits[0].point.lat,
      lng: data.hits[0].point.lng,
    };
  } catch (err) {
    console.error("Error geocoding with GraphHopper:", err);
    return null;
  }
}
