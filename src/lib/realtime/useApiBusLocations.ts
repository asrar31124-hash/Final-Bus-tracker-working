import { useEffect, useState } from "react";
import { fetchActiveBuses, type BusLocationRecord } from "@/lib/bus-location-api";

/** Polls the bus location API for live driver positions. */
export function useApiBusLocations(pollMs = 3000) {
  const [locations, setLocations] = useState<BusLocationRecord[]>([]);

  useEffect(() => {
    const poll = async () => {
      const buses = await fetchActiveBuses();
      setLocations(buses);
    };

    void poll();
    const interval = setInterval(() => void poll(), pollMs);
    return () => clearInterval(interval);
  }, [pollMs]);

  return locations;
}
