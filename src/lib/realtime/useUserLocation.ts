import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/** Pushes the device's location to Supabase every time it changes. */
export function useUserLocation(
  watch: boolean,
  onError?: (e: GeolocationPositionError) => void,
) {
  useEffect(() => {
    if (!watch || !supabase) return;

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await supabase.from("user_locations").insert({
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => {
        onError?.(err);
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [watch, onError]);
}
