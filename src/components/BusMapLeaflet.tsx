import { getRoute, type RoutePoint } from "@/lib/graphhopper";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { buses, CAMPUS, type Bus } from "@/lib/bus-data";
import { useLiveBusesLocations } from "@/lib/realtime/useLiveBusesLocations";
import { useMemo, useEffect, useState } from "react";
// Removed duplicate import of RoutePoint
import { useMap, MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, Polyline } from "react-leaflet";

const statusColor: Record<Bus["status"], string> = {
  active: "#10B981",
  idle: "#F59E0B",
  issue: "#D90429",
  offline: "#6B7280",
};

// Auto-center updater for React Leaflet
function MapUpdater({
  center,
  zoom,
  gpsActive,
  followUser,
}: {
  center: [number, number] | null;
  zoom?: number;
  gpsActive?: boolean;
  followUser?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (center && gpsActive && followUser) {
      map.setView(center, zoom ?? map.getZoom());
    }
  }, [center, zoom, map, gpsActive, followUser]);

  return null;
}

function makeBusIcon(color: string, selected: boolean) {
  const size = selected ? 44 : 38;
  const pulse = color === statusColor.active
    ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:.35;animation:pulse-ring 1.8s cubic-bezier(.2,.7,.4,1) infinite"></span>`
    : "";
  return L.divIcon({
    className: "ggi-bus-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse}
        <div style="position:relative;width:100%;height:100%;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 6px 18px -4px rgba(0,0,0,.35);display:grid;place-items:center;${selected ? "outline:4px solid rgba(255,255,255,.7);outline-offset:-2px;" : ""}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
        </div>
      </div>
    `,
  });
}

// Google Maps style blue dot icon for user GPS location
function makeUserIcon() {
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="position:relative;width:24px;height:24px;display:grid;place-items:center;pointer-events:none;">
        <span style="position:absolute;inset:-8px;border-radius:9999px;background:#3B82F6;opacity:.35;animation:pulse-ring 1.8s cubic-bezier(.2,.7,.4,1) infinite"></span>
        <div style="position:relative;width:16px;height:16px;border-radius:9999px;background:#3B82F6;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);"></div>
      </div>
    `,
  });
}

function campusIcon() {
  return L.divIcon({
    className: "ggi-campus-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `
      <div style="position:relative;width:44px;height:44px;display:grid;place-items:center;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:#1E3A8A;opacity:.2"></div>
        <div style="position:relative;width:28px;height:28px;border-radius:9999px;background:#1E3A8A;border:3px solid #fff;box-shadow:0 6px 18px -4px rgba(30,58,138,.6);display:grid;place-items:center;color:#fff;font:700 11px Poppins,system-ui">G</div>
      </div>
    `,
  });
}

type LiveBus = { id: string; bus_name: string | null; driver_name: string | null; route_name: string | null; active: boolean };
type LiveLocation = { id: string; bus_id: string; latitude: number | null; longitude: number | null; speed: number | null; created_at: string };

export function BusMapLeaflet({
  selectedId,
  onSelect,
  tick,
  routePoints,
  userLocation,
  gpsActive,
  followUser,
}: {
  selectedId?: string;
  onSelect?: (id: string) => void;
  tick: number;
  routePoints?: RoutePoint[];
  userLocation?: { lat: number; lng: number; accuracy?: number } | null;
  gpsActive?: boolean;
  followUser?: boolean;
}) {
  const { busesPayloads, locationsPayloads } = useLiveBusesLocations();
  const [busesById, setBusesById] = useState<Map<string, LiveBus>>(new Map());
  const [locationsById, setLocationsById] = useState<Map<string, LiveLocation>>(new Map());

  // Apply realtime bus payloads
  useEffect(() => {
    for (const payload of busesPayloads) {
      const maybeNew = payload?.record ?? payload?.new ?? payload?.data ?? payload?.payload?.new;
      const maybeOp = payload?.event ?? payload?.type ?? payload?.op;

      if (maybeNew?.id && (maybeOp === "INSERT" || maybeOp === "UPDATE")) {
        setBusesById((prev) => {
          const next = new Map(prev);
          next.set(maybeNew.id, maybeNew as LiveBus);
          return next;
        });
      }

      if (maybeOp === "DELETE" && (payload?.old?.id || maybeNew?.id)) {
        const id = payload?.old?.id ?? maybeNew?.id;
        setBusesById((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
    }
  }, [busesPayloads]);

  // Apply realtime locations payloads
  useEffect(() => {
    for (const payload of locationsPayloads) {
      const maybeNew = payload?.record ?? payload?.new ?? payload?.data ?? payload?.payload?.new;
      const maybeOp = payload?.event ?? payload?.type ?? payload?.op;

      if (maybeNew?.id && (maybeOp === "INSERT" || maybeOp === "UPDATE")) {
        setLocationsById((prev) => {
          const next = new Map(prev);
          next.set(maybeNew.id, maybeNew as LiveLocation);
          return next;
        });
      }

      if (maybeOp === "DELETE" && (payload?.old?.id || maybeNew?.id)) {
        const id = payload?.old?.id ?? maybeNew?.id;
        setLocationsById((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
    }
  }, [locationsPayloads]);

  const liveLocations = useMemo<LiveLocation[]>(() => {
    return Array.from(locationsById.values()).filter(
      (l) => typeof l.latitude === "number" && typeof l.longitude === "number"
    );
  }, [locationsById]);

  // Fallback to static data if no live data
  const hasLiveData = liveLocations.length > 0 || busesById.size > 0;
  const staticDrift = (b: Bus): [number, number] => {
    if (b.status !== "active") return [b.lat, b.lng];
    const d = 0.0015;
    return [
      b.lat + Math.sin((tick + b.lat * 100) / 2) * d,
      b.lng + Math.cos((tick + b.lng * 100) / 2) * d,
    ];
  };

  const userPosition = useMemo<[number, number] | null>(() => {
    return userLocation ? [userLocation.lat, userLocation.lng] : null;
  }, [userLocation]);
  const userAccuracy = userLocation?.accuracy;
  const userIcon = useMemo(() => makeUserIcon(), []);

  // State for routed path from user to campus
  const [userRoute, setUserRoute] = useState<[number, number][] | null>(null);
  const [userRouteDistance, setUserRouteDistance] = useState<number | null>(null);

  // Render accuracy circle if available
  const accuracyCircle = userAccuracy && userPosition ? (
    <Circle
      center={userPosition}
      radius={userAccuracy}
      pathOptions={{ color: "#3B82F6", opacity: 0.2, fillOpacity: 0.1 }}
    />
  ) : null;

  useEffect(() => {
    if (!userPosition) {
      setUserRoute(null);
      setUserRouteDistance(null);
      return;
    }
    // Async fetch route via GraphHopper
    void (async () => {
      const result = await getRoute({
        fromLat: userPosition[0],
        fromLng: userPosition[1],
        toLat: CAMPUS.lat,
        toLng: CAMPUS.lng,
        vehicle: "car",
      });
      if (result) {
        setUserRoute(result.points.map(p => [p.lat, p.lng]));
        setUserRouteDistance(result.distance);
      } else {
        setUserRoute(null);
        setUserRouteDistance(null);
      }
    })();
  }, [userPosition]);


  return (
    <MapContainer
      center={[CAMPUS.lat, CAMPUS.lng]}
      zoom={12}
      scrollWheelZoom
      zoomControl
      className="h-full w-full"
      style={{ background: "var(--background)", height: "100%", minHeight: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        errorTileUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23999'%3EMap%3C/text%3E%3C/svg%3E"
      />

      {/* Auto-recenter on user location when followUser is active */}
      {userPosition && gpsActive && (
        <MapUpdater center={userPosition} zoom={15} gpsActive={gpsActive} followUser={followUser} />
      )}

      <Marker position={[CAMPUS.lat, CAMPUS.lng]} icon={campusIcon()}>
        <Popup>
          <div style={{ fontFamily: "Poppins,system-ui", fontWeight: 700 }}>11th Km Stone, Amritsar - Jammu Highway</div>
          <div style={{ color: "#6B7280", fontSize: 12 }}>NH 54, Amritsar, Punjab 143501</div>
        </Popup>
      </Marker>
      <CircleMarker
        center={[CAMPUS.lat, CAMPUS.lng]}
        radius={28}
        pathOptions={{ color: "#1E3A8A", weight: 1, fillColor: "#1E3A8A", fillOpacity: 0.08 }}
      />



      {/* GraphHopper Route (Styled like premium navigation path) */}
      {routePoints && routePoints.length > 0 && (
        <>
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "#3B82F6", weight: 6, opacity: 0.95, lineCap: "round", lineJoin: "round" }}
          />
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "#93C5FD", weight: 2, opacity: 0.8, dashArray: "6 12", lineCap: "round" }}
          />
        </>
      )}

      {/* Live Device User Marker */}
      {userPosition && (
        <>
          <CircleMarker
            center={userPosition}
            radius={12}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#3B82F6",
              fillOpacity: 1,
            }}
          />
          <Marker position={userPosition} icon={userIcon} zIndexOffset={1000}>
            <Popup>
              <div style={{ fontFamily: "Poppins,system-ui", fontWeight: 700 }}>Your Location</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>
                {userAccuracy ? `Accuracy: ±${Math.round(userAccuracy)} m` : "Live GPS from your device"}
              </div>
            </Popup>
          </Marker>
          {accuracyCircle}

          {/* Render routed path from user to campus */}
          {userRoute && (
            <Polyline
              positions={userRoute}
              pathOptions={{ color: "#3B82F6", weight: 5, dashArray: undefined }}
            />
          )}

          {/* Distance label at midpoint of routed path */}
          {userRouteDistance !== null && userRoute && (
            (() => {
              // Find midpoint of the route (approximate by middle index)
              const midIdx = Math.floor(userRoute.length / 2);
              const midPoint = userRoute[midIdx];
              const km = (userRouteDistance / 1000).toFixed(2);
              return (
                <Marker
                  position={midPoint}
                  icon={L.divIcon({
                    className: "distance-label",
                    html: `<div style="background:#3B82F6;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;">${km} km</div>`,
                    iconSize: [0, 0],
                  })}
                />
              );
            })()
          )}
        </>
      )}

      {/* Live buses from Supabase */}
      {liveLocations.map((loc) => {
        const bus = busesById.get(loc.bus_id);
        const selected = selectedId === loc.bus_id;
        return (
          <Marker
            key={loc.id}
            position={[loc.latitude as number, loc.longitude as number]}
            icon={makeBusIcon(statusColor.active, selected)}
            eventHandlers={{ click: () => onSelect?.(loc.bus_id) }}
          >
            <Popup>
              <div style={{ fontFamily: "Poppins,system-ui", fontWeight: 700 }}>
                {bus?.bus_name ?? loc.bus_id}
              </div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>
                Driver: {bus?.driver_name ?? "—"}
              </div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                Speed: {loc.speed ? `${Math.round(loc.speed * 3.6)} km/h` : "—"}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Fallback to static buses */}
      
    </MapContainer>
  );
}
