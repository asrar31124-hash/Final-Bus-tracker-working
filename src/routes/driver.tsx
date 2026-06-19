import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Play, Square, Satellite, AlertTriangle, MapPin, Phone, Fuel, Gauge } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { BusMap } from "@/components/BusMap";
import { routeStops } from "@/lib/bus-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/driver")({
  head: () => ({ meta: [{ title: "Driver Dashboard · GGI Transit" }] }),
  component: DriverPage,
});

function DriverPage() {
  const [tracking, setTracking] = useState(true);
  const lastSentRef = useRef<number>(0);
  const geolocation = useGeolocation({ enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 });

  // Send location updates to Supabase when tracking is active
  useEffect(() => {
    if (!tracking || !geolocation.latitude || !geolocation.longitude || !supabase) return;

    const sendUpdate = async () => {
      const now = Date.now();
      if (now - lastSentRef.current < 5000) return; // Throttle to every 5 seconds

      try {
        // Example: Insert into a locations table (adjust to your actual table schema!)
        await supabase?.from("locations").insert({
          bus_id: "GGI-02", // Update to your actual bus ID
          latitude: geolocation.latitude,
          longitude: geolocation.longitude,
          speed: geolocation.speed,
          timestamp: new Date().toISOString(),
        });
        lastSentRef.current = now;
      } catch (error) {
        console.error("Error sending location update:", error);
      }
    };

    sendUpdate();
    const interval = setInterval(sendUpdate, 5000);
    return () => clearInterval(interval);
  }, [tracking, geolocation.latitude, geolocation.longitude, geolocation.speed]);

  const gpsStatus = geolocation.loading ? "Acquiring" : geolocation.error ? "Error" : tracking ? "Active" : "Idle";
  const speedValue = geolocation.speed ? `${Math.round(geolocation.speed * 3.6)} km/h` : "—"; // Convert m/s to km/h

  return (
    <DashboardShell title="Driver Console" subtitle="Shuttle B2 · Mohali → Campus">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border bg-gradient-brand p-6 text-white shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/70">Today's shift</div>
                <div className="font-display text-2xl font-bold">Good morning, Simran 👋</div>
                <div className="mt-1 text-sm text-white/80">Route active · 4 of 6 stops completed</div>
              </div>
              <button
                onClick={() => {
                  setTracking((t) => !t);
                  toast.success(tracking ? "Tracking paused" : "Live tracking started");
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-soft transition",
                  tracking ? "bg-white/15 text-white hover:bg-white/25" : "bg-white text-brand",
                )}
              >
                {tracking ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {tracking ? "Stop tracking" : "Start tracking"}
              </button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tile icon={Satellite} label="GPS" value={gpsStatus} />
              <Tile icon={Gauge} label="Speed" value={speedValue} />
              <Tile icon={Fuel} label="Fuel" value="72%" />
              <Tile icon={MapPin} label="Distance" value="14.2 km" />
            </div>
          </div>

          <BusMap className="h-[360px]" />

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-base font-semibold">Route stops</div>
              <span className="text-xs text-muted-foreground">6 stops · 32 km</span>
            </div>
            <ol className="space-y-3">
              {routeStops.map((s) => (
                <li key={s.name} className="flex items-center justify-between rounded-xl border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "grid h-9 w-9 place-items-center rounded-full text-xs font-semibold",
                      s.status === "done" && "bg-muted text-muted-foreground",
                      s.status === "current" && "bg-brand text-white",
                      s.status === "next" && "border-2 border-dashed border-muted-foreground/40 text-muted-foreground",
                    )}>
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">Scheduled {s.time}</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium capitalize text-muted-foreground">{s.status}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="space-y-4">
          <button
            onClick={() => toast.error("Emergency alert sent to admin")}
            className="w-full overflow-hidden rounded-2xl bg-gradient-danger p-5 text-left text-white shadow-glow transition hover:brightness-110"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15"><AlertTriangle className="h-6 w-6" /></div>
              <div>
                <div className="font-display text-lg font-bold">Emergency SOS</div>
                <div className="text-xs text-white/80">Notify control room instantly</div>
              </div>
            </div>
          </button>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="font-display text-sm font-semibold">Control room</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft text-brand"><Phone className="h-4 w-4" /></div>
              <div>
                <div className="text-sm font-semibold">+91 98765 43210</div>
                <div className="text-xs text-muted-foreground">Available 24/7</div>
              </div>
            </div>
            <button className="mt-4 w-full rounded-xl bg-brand-soft py-2 text-sm font-semibold text-brand">Call dispatcher</button>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="font-display text-sm font-semibold">Vehicle check</div>
            <ul className="mt-3 space-y-2 text-sm">
              {["Brakes", "Tires", "Lights", "First aid"].map((t) => (
                <li key={t} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t}</span>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">OK</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}

function Tile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
      <Icon className="h-4 w-4 text-white/80" />
      <div className="mt-2 text-[10px] uppercase tracking-wider text-white/70">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}