import { useEffect, useState, type ComponentType } from "react";
import { Navigation, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { buses, CAMPUS, type Bus } from "@/lib/bus-data";
import type { RoutePoint } from "@/lib/graphhopper";

interface BusMapProps {
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  routePoints?: RoutePoint[];
  userLocation?: { lat: number; lng: number; accuracy?: number } | null;
  gpsActive?: boolean;
  gpsAcquiring?: boolean;
  followUser?: boolean;
  onToggleGps?: () => void;
  onToggleFollow?: () => void;
}

const statusColor: Record<Bus["status"], string> = {
  active: "#10B981",
  idle: "#F59E0B",
  issue: "#D90429",
  offline: "#6B7280",
};

type LeafletProps = {
  selectedId?: string;
  onSelect?: (id: string) => void;
  tick: number;
  routePoints?: RoutePoint[];
  userLocation?: { lat: number; lng: number; accuracy?: number } | null;
  gpsActive?: boolean;
  gpsAcquiring?: boolean;
  followUser?: boolean;
};

/**
 * Real Leaflet + OpenStreetMap map. Mounted client-only — Leaflet uses
 * `window` and crashes during SSR.
 */
export function BusMap({
  selectedId,
  onSelect,
  className,
  routePoints,
  userLocation,
  gpsActive,
  gpsAcquiring,
  followUser,
  onToggleGps,
  onToggleFollow,
}: BusMapProps) {
  const [LeafletMap, setLeafletMap] = useState<ComponentType<LeafletProps> | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    void import("./BusMapLeaflet").then((mod) => setLeafletMap(() => mod.BusMapLeaflet));
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-card shadow-soft", className)}>
      {LeafletMap ? (
        <LeafletMap
          selectedId={selectedId}
          onSelect={onSelect}
          tick={tick}
          routePoints={routePoints}
          userLocation={userLocation}
          gpsActive={gpsActive}
          gpsAcquiring={gpsAcquiring}
          followUser={followUser}
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-muted/40" />
      )}

      {/* GPS status overlay */}
      {gpsActive && !userLocation && (
        <div className="pointer-events-none absolute inset-x-0 top-14 z-[500] flex justify-center">
          <div className="glass rounded-full border px-4 py-2 text-xs font-medium shadow-soft">
            {gpsAcquiring ? "Acquiring your location…" : "Waiting for GPS…"}
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute right-3 top-3 z-[500] flex flex-col gap-2">
        <button
          onClick={onToggleGps}
          className={cn(
            "glass pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border shadow-soft transition-all hover:scale-105 active:scale-95",
            gpsActive ? "border-brand bg-brand-soft text-brand" : "text-muted-foreground bg-card hover:text-foreground"
          )}
          title={gpsActive ? "Disable GPS Location" : "Enable GPS Location"}
        >
          <Compass className={cn("h-5 w-5", gpsActive && "animate-pulse text-brand")} />
        </button>
        {gpsActive && (
          <button
            onClick={onToggleFollow}
            className={cn(
              "glass pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border shadow-soft transition-all hover:scale-105 active:scale-95",
              followUser ? "border-success bg-success/10 text-success" : "text-muted-foreground bg-card hover:text-foreground"
            )}
            title={followUser ? "Disable Auto-Center" : "Enable Auto-Center"}
          >
            <Navigation className={cn("h-4 w-4 rotate-45", followUser ? "fill-success text-success" : "")} />
          </button>
        )}
      </div>

      <div className="pointer-events-none absolute left-3 top-3 z-[500]">
        <div className="glass pointer-events-auto flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-soft">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live · {buses.filter((b) => b.status === "active").length} buses moving
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[500]">
        <div className="glass pointer-events-auto flex items-center gap-3 rounded-xl border px-3 py-2 text-xs shadow-soft">
          <LegendDot color={statusColor.active} label="Active" />
          <LegendDot color={statusColor.idle} label="Idle" />
          <LegendDot color={statusColor.issue} label="Issue" />
          <LegendDot color={statusColor.offline} label="Offline" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 z-[500]">
        <div className="glass pointer-events-auto flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-soft">
          <Navigation className="h-3 w-3 text-brand" />
          {CAMPUS.name}
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
