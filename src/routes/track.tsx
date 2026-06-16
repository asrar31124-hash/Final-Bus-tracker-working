import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Search, Bus as BusIcon, Clock, Users, Gauge, Navigation } from "lucide-react";
import { BusMap } from "@/components/BusMap";
import { buses, type Bus, CAMPUS } from "@/lib/bus-data";
import { cn } from "@/lib/utils";
import { RoutePlanner } from "@/components/RoutePlanner";
import { getRoute } from "@/lib/graphhopper";
import type { RouteResult } from "@/lib/graphhopper";
import { useLiveBusesLocations } from "@/lib/realtime/useLiveBusesLocations";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Live Bus Tracking — GGI Transit" },
      { name: "description", content: "Live map of every GGI bus, with real-time ETAs and route details." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const [selected, setSelected] = useState<string>("");
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState<RouteResult | null>(null);
  // Fallback bus when no static buses are available
  const fallbackBus: Bus = {
    id: "none",
    name: "No Bus",
    route: "",
    driver: "",
    status: "offline",
    speed: 0,
    eta: "",
    occupancy: 0,
    capacity: 0,
    nextStop: "",
    lat: CAMPUS.lat,
    lng: CAMPUS.lng,
  };

  // GPS Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsAcquiring, setGpsAcquiring] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [navRoute, setNavRoute] = useState<RouteResult | null>(null);
  const [navLoading, setNavLoading] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastRoutedUserRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastRoutedBusRef = useRef<{ lat: number; lng: number } | null>(null);

  const userPosition = useMemo<[number, number] | null>(() => {
    return userLocation ? [userLocation.lat, userLocation.lng] : null;
  }, [userLocation]);

  // Accuracy radius (if available)
  const userAccuracy = userLocation?.accuracy;

  // Realtime locations integration
  const { locationsPayloads } = useLiveBusesLocations();

  const filtered = buses.filter(
    (b) => b.id.toLowerCase().includes(query.toLowerCase()) || b.route.toLowerCase().includes(query.toLowerCase()),
  );
  
  const active = buses.find((b) => b.id === selected) ?? fallbackBus;

  // Resolve selected bus's live coordinates
  const liveLoc = useMemo(() => {
    const latest = new Map<string, { latitude: number; longitude: number; speed: number | null }>();
    for (const payload of locationsPayloads) {
      const maybeNew = payload?.record ?? payload?.new ?? payload?.data ?? payload?.payload?.new;
      const maybeOp = payload?.event ?? payload?.type ?? payload?.op;
      if (maybeNew?.bus_id && (maybeOp === "INSERT" || maybeOp === "UPDATE")) {
        if (typeof maybeNew.latitude === "number" && typeof maybeNew.longitude === "number") {
          latest.set(maybeNew.bus_id, {
            latitude: maybeNew.latitude,
            longitude: maybeNew.longitude,
            speed: maybeNew.speed,
          });
        }
      }
    }
    return latest.get(selected);
  }, [locationsPayloads, selected]);

  const busLat = liveLoc?.latitude ?? active.lat;
  const busLng = liveLoc?.longitude ?? active.lng;
  const busSpeed = liveLoc?.speed !== undefined && liveLoc?.speed !== null
    ? Math.round(liveLoc.speed * 3.6)
    : active.speed;

  const gpsFallbackTriedRef = useRef(false);

  const fastGpsOptions: PositionOptions = {
    enableHighAccuracy: false,
    maximumAge: 300000,
    timeout: 30000,
  };

  const highAccuracyOptions: PositionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 30000,
  };

  const applyPosition = (position: GeolocationPosition) => {
    setUserLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    });
    setGpsAcquiring(false);
  };

  const stopWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startWatch = (options: PositionOptions) => {
    stopWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      applyPosition,
      (error) => {
        console.error("GPS error:", error.code, error.message);

        if (error.code === 3 && !gpsFallbackTriedRef.current) {
          gpsFallbackTriedRef.current = true;
          toast.info("Network location timed out. Trying high-accuracy GPS...");
          navigator.geolocation.getCurrentPosition(applyPosition, () => {}, highAccuracyOptions);
          startWatch(highAccuracyOptions);
          return;
        }

        if (error.code === 1) {
          setGpsActive(false);
          setGpsAcquiring(false);
          setUserLocation(null);
          stopWatch();
          toast.error("Location permission denied. Allow location access in your browser settings.");
          return;
        }

        if (error.code === 2 || error.code === 3) {
          setGpsActive(false);
          setGpsAcquiring(false);
          setUserLocation(null);
          stopWatch();
          toast.error(
            error.code === 2
              ? "Location unavailable. Enable GPS on your device and try again."
              : "Location request timed out. Move to an open area and retry.",
          );
        }
      },
      options,
    );
  };

  // Start Geolocation Tracking
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    gpsFallbackTriedRef.current = false;
    setGpsActive(true);
    setGpsAcquiring(true);
    setFollowUser(true);
    toast.info("Requesting GPS location...");

    // Network-based location first — works on desktop; upgrades to GPS if needed
    navigator.geolocation.getCurrentPosition(applyPosition, () => {}, fastGpsOptions);
    startWatch(fastGpsOptions);
  };

  // Stop Geolocation Tracking
  const stopGpsTracking = () => {
    stopWatch();
    setGpsActive(false);
    setGpsAcquiring(false);
    setUserLocation(null);
    setNavRoute(null);
    lastRoutedUserRef.current = null;
    lastRoutedBusRef.current = null;
    toast.info("GPS tracking disabled.");
  };

  // Auto-start GPS when the track page loads (client only)
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    startGpsTracking();
    return () => stopWatch();
  }, []);

  // Recalculate route between active bus and user
  useEffect(() => {
    if (!gpsActive || !userLocation || !selected) {
      setNavRoute(null);
      return;
    }

    const checkAndFetchRoute = async () => {
      const hasUserMoved = !lastRoutedUserRef.current ||
        Math.abs(lastRoutedUserRef.current.lat - userLocation.lat) > 0.0002 ||
        Math.abs(lastRoutedUserRef.current.lng - userLocation.lng) > 0.0002;

      const hasBusMoved = !lastRoutedBusRef.current ||
        Math.abs(lastRoutedBusRef.current.lat - busLat) > 0.0002 ||
        Math.abs(lastRoutedBusRef.current.lng - busLng) > 0.0002;

      if (hasUserMoved || hasBusMoved) {
        setNavLoading(true);
        try {
          const routeResult = await getRoute({
            fromLat: busLat,
            fromLng: busLng,
            toLat: userLocation.lat,
            toLng: userLocation.lng,
          });
          if (routeResult) {
            setNavRoute(routeResult);
            lastRoutedUserRef.current = userLocation;
            lastRoutedBusRef.current = { lat: busLat, lng: busLng };
          }
        } catch (err) {
          console.error("Error calculating route to user:", err);
        } finally {
          setNavLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void checkAndFetchRoute();
    }, 500);

    return () => clearTimeout(timer);
  }, [gpsActive, userLocation, selected, busLat, busLng]);

  const displayedPoints = gpsActive && navRoute ? navRoute.points : route?.points;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="glass z-10 flex h-14 items-center gap-3 border-b px-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
        </Link>
        <div className="hidden h-5 w-px bg-border sm:block" />
        <div className="font-display text-sm font-semibold sm:text-base">Live Bus Tracking</div>
        <div className="ml-auto flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bus or route…"
            className="w-44 bg-transparent outline-none placeholder:text-muted-foreground sm:w-64"
          />
        </div>
      </header>

      <div className="grid flex-1 overflow-hidden lg:grid-cols-[340px_1fr_320px]">
        {/* Bus list */}
        <aside className="hidden flex-col overflow-y-auto border-r bg-card/40 lg:flex">
          <div className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active fleet</div>
            <div className="mt-1 text-2xl font-display font-bold">{filtered.length} buses</div>
          </div>
          <div className="flex-1 space-y-2 px-3 pb-4">
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b.id)}
                className={cn(
                  "w-full rounded-xl border bg-card p-3 text-left shadow-soft transition hover:border-brand/50",
                  selected === b.id && "border-brand ring-2 ring-brand/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("grid h-9 w-9 place-items-center rounded-lg text-white",
                      b.status === "active" && "bg-success",
                      b.status === "idle" && "bg-warning",
                      b.status === "issue" && "bg-danger",
                      b.status === "offline" && "bg-muted-foreground",
                    )}>
                      <BusIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{b.id} · {b.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{b.route}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">ETA</div>
                    <div className="text-sm font-semibold">{b.eta}</div>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                No buses match your search.
              </div>
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="relative p-3 sm:p-4 h-full">
          <BusMap 
            className="h-full w-full" 
            selectedId={selected} 
            onSelect={setSelected} 
            routePoints={displayedPoints}
            userLocation={userLocation}
            gpsActive={gpsActive}
            gpsAcquiring={gpsAcquiring}
            followUser={followUser}
            onToggleGps={() => {
              if (gpsActive) {
                stopGpsTracking();
              } else {
                startGpsTracking();
              }
            }}
            onToggleFollow={() => setFollowUser((f) => !f)}
          />
        </div>

        {/* Detail panel */}
        <aside className="hidden flex-col overflow-y-auto border-l bg-card/40 p-4 lg:flex">
          <RoutePlanner onRouteFound={setRoute} />

          {/* Dynamic Navigation details to User Location */}
          {gpsActive && userLocation && (
            <div className="mt-4 rounded-2xl border border-brand/20 bg-brand-soft/30 p-4 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="font-display text-xs font-bold text-brand flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
                  </span>
                  Live Route to You
                </div>
                {navLoading && <span className="text-[10px] text-muted-foreground animate-pulse">Routing...</span>}
              </div>
              {navRoute ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border bg-background p-3">
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Distance</div>
                      <div className="text-sm font-semibold text-foreground">{(navRoute.distance / 1000).toFixed(2)} km</div>
                    </div>
                    <div className="rounded-xl border bg-background p-3">
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Est. ETA</div>
                      <div className="text-sm font-semibold text-foreground">{Math.round(navRoute.time / 60000)} mins</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center">
                    Calculated from {active.id}'s live GPS to your current coordinates.
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-2 animate-pulse">
                  Acquiring routing data...
                </div>
              )}
            </div>
          )}

          {route && !gpsActive && (
            <div className="mt-4 rounded-2xl border bg-card p-4 shadow-soft">
              <div className="font-display text-sm font-semibold mb-3">Route Details</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Distance</div>
                  <div className="text-sm font-semibold">{(route.distance / 1000).toFixed(2)} km</div>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. Time</div>
                  <div className="text-sm font-semibold">{Math.round(route.time / 60000)} min</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
                <BusIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg font-bold">{active.id}</div>
                <div className="truncate text-xs text-muted-foreground">{active.route}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat icon={Clock} label="ETA" value={active.eta} />
              <Stat icon={Gauge} label="Speed" value={`${busSpeed} km/h`} />
              <Stat icon={Users} label="On board" value={`${active.occupancy}/${active.capacity}`} />
            </div>
            <div className="mt-4 rounded-xl bg-brand-soft/60 px-3 py-2 text-xs">
              <div className="text-muted-foreground">Driver</div>
              <div className="font-semibold text-foreground">{active.driver}</div>
            </div>
          </div>

          <button 
            onClick={() => {
              if (!gpsActive) {
                startGpsTracking();
              } else {
                setFollowUser(true);
                toast.success("Centering map on your current location.");
              }
            }}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-105"
          >
            <Navigation className="h-4 w-4" /> {gpsActive ? "Center on My Location" : "Track from My Location"}
          </button>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-2.5">
      <Icon className="mx-auto h-4 w-4 text-brand" />
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}