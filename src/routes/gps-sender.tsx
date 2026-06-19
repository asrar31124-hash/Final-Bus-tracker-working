import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Play, Square, MapPin, Navigation, AlertCircle } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";

export const Route = createFileRoute("/gps-sender")({
  head: () => ({ meta: [{ title: "GPS Sender | GGI Transit" }] }),
  component: GPSSenderPage,
});

function GPSSenderPage() {
  const [tracking, setTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState<{
    latitude: number;
    longitude: number;
    speed: number | null;
    timestamp: number;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "tracking" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busId, setBusId] = useState("GGI-02");
  const watchIdRef = useRef<number | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setTracking(true);
    setStatus("tracking");
    setErrorMessage(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData = {
          bus_id: busId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
        };

        setLastLocation({
          ...locationData,
          timestamp: position.timestamp,
        });

        try {
          await fetch("https://sanju314s.app.n8n.cloud/webhook-test/bus-location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(locationData),
          });
        } catch (error) {
          console.error("Error sending location:", error);
          // Don't stop tracking on network errors, just log
        }
      },
      (error) => {
        setStatus("error");
        setErrorMessage(`GPS Error: ${error.message}`);
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    setStatus("idle");
  };

  return (
    <DashboardShell title="GPS Sender" subtitle="Send live GPS location">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Control Panel */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4">
            {/* Bus ID Input */}
            <div className="space-y-2">
              <label htmlFor="busId" className="text-sm font-medium text-muted-foreground">
                Bus ID
              </label>
              <input
                id="busId"
                type="text"
                value={busId}
                onChange={(e) => setBusId(e.target.value)}
                disabled={tracking}
                className="w-full px-4 py-2 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
              {status === "tracking" ? (
                <div className="flex items-center gap-2 text-success">
                  <div className="relative h-3 w-3">
                    <div className="absolute animate-ping rounded-full bg-success opacity-75" />
                    <div className="relative h-3 w-3 rounded-full bg-success" />
                  </div>
                  <span className="font-medium">Tracking Active</span>
                </div>
              ) : status === "error" ? (
                <div className="flex items-center gap-2 text-danger">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                  <span className="font-medium">Idle</span>
                </div>
              )}
            </div>

            {/* Start/Stop Buttons */}
            <div className="flex gap-3">
              {!tracking ? (
                <button
                  onClick={startTracking}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  <Play className="h-4 w-4" />
                  Start Tracking
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
                >
                  <Square className="h-4 w-4" />
                  Stop Tracking
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Last Location */}
        {lastLocation && (
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand" />
              Last Location
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Latitude</div>
                <div className="font-mono text-lg">{lastLocation.latitude.toFixed(6)}</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Longitude</div>
                <div className="font-mono text-lg">{lastLocation.longitude.toFixed(6)}</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Speed</div>
                <div className="font-mono text-lg">
                  {lastLocation.speed
                    ? `${(lastLocation.speed * 3.6).toFixed(1)} km/h`
                    : "—"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Updated</div>
                <div className="font-mono text-lg">
                  {new Date(lastLocation.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
          <Navigation className="h-5 w-5 text-brand shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-brand">Note</div>
            <div className="text-sm text-muted-foreground">
              Location data is sent to https://sanju314s.app.n8n.cloud/webhook-test/bus-location
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
