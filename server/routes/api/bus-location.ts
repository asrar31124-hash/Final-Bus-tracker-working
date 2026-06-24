import { defineEventHandler, readBody, getQuery, setResponseStatus } from "h3";
import {
  getBusLocation,
  listTrackingBuses,
  stopBusTracking,
  updateBusLocation,
} from "../../utils/bus-location-store";

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === "GET") {
    const query = getQuery(event);
    const busId = typeof query.bus_id === "string" ? query.bus_id : undefined;

    if (busId) {
      const location = getBusLocation(busId);
      if (!location || !location.is_tracking) {
        setResponseStatus(event, 404);
        return { error: "Bus not found or not currently tracking", bus_id: busId };
      }
      return location;
    }

    return { buses: listTrackingBuses() };
  }

  if (method === "POST") {
    const body = (await readBody(event)) as {
      bus_id?: string;
      latitude?: number;
      longitude?: number;
      speed?: number | null;
      is_tracking?: boolean;
      action?: string;
    };

    if (!body?.bus_id) {
      setResponseStatus(event, 400);
      return { error: "bus_id is required" };
    }

    if (body.action === "stop") {
      const stopped = stopBusTracking(body.bus_id);
      return { success: true, location: stopped };
    }

    if (typeof body.latitude !== "number" || typeof body.longitude !== "number") {
      setResponseStatus(event, 400);
      return { error: "latitude and longitude are required" };
    }

    const location = updateBusLocation({
      bus_id: body.bus_id,
      latitude: body.latitude,
      longitude: body.longitude,
      speed: body.speed ?? null,
      is_tracking: body.is_tracking !== false,
    });

    return { success: true, location };
  }

  setResponseStatus(event, 405);
  return { error: "Method not allowed" };
});
