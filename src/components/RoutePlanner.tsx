import { useState } from "react";
import { Search, MapPin, Navigation, Clock, Map } from "lucide-react";
import { getRoute, geocode } from "@/lib/graphhopper";
import type { RoutePoint, RouteResult } from "@/lib/graphhopper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RoutePlannerProps {
  onRouteFound: (route: RouteResult) => void;
}

export function RoutePlanner({ onRouteFound }: RoutePlannerProps) {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fromPoint, setFromPoint] = useState<RoutePoint | null>(null);
  const [toPoint, setToPoint] = useState<RoutePoint | null>(null);

  const handlePlanRoute = async () => {
    setLoading(true);
    try {
      let startPoint = fromPoint;
      let endPoint = toPoint;

      if (!startPoint && fromQuery) {
        startPoint = await geocode(fromQuery);
      }
      if (!endPoint && toQuery) {
        endPoint = await geocode(toQuery);
      }

      if (startPoint && endPoint) {
        const route = await getRoute({
          fromLat: startPoint.lat,
          fromLng: startPoint.lng,
          toLat: endPoint.lat,
          toLng: endPoint.lng,
        });
        if (route) {
          onRouteFound(route);
        }
      }
    } catch (err) {
      console.error("Error planning route:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft space-y-4">
      <div className="flex items-center gap-2 font-display text-lg font-bold">
        <Navigation className="h-5 w-5 text-brand" />
        Route Planner
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="from">From</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="from"
              type="text"
              placeholder="Enter start location..."
              className="pl-10"
              value={fromQuery}
              onChange={(e) => setFromQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="to">To</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="to"
              type="text"
              placeholder="Enter destination..."
              className="pl-10"
              value={toQuery}
              onChange={(e) => setToQuery(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handlePlanRoute}
          disabled={loading}
          className="w-full bg-gradient-brand hover:brightness-110"
        >
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Planning..." : "Plan Route"}
        </Button>
      </div>
    </div>
  );
}
