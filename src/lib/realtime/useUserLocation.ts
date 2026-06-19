import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // <-- your existing supabase client

/** Pushes the device’s location to Supabase every time it changes. */
export function useUserLocation(
  watch: boolean,
  onError?: (e: GeolocationPositionError) => void
) {
  useEffect(() => {
    if (!watch) return;

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
      }
    );

    // cleanup on unmount or when watch is turned off
    return () => navigator.geolocation.clearWatch(id);
  }, [watch, onError]);
}
