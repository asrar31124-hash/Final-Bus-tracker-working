export type BusLocationRecord = {
  bus_id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  is_tracking: boolean;
  updated_at: string;
};

const API_BASE = "/api/bus-location";

export async function sendBusLocation(data: {
  bus_id: string;
  latitude: number;
  longitude: number;
  speed?: number | null;
}): Promise<boolean> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function stopBusLocationTracking(busId: string): Promise<boolean> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bus_id: busId, action: "stop" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchBusLocation(busId: string): Promise<BusLocationRecord | null> {
  try {
    const res = await fetch(`${API_BASE}?bus_id=${encodeURIComponent(busId)}`);
    if (!res.ok) return null;
    return (await res.json()) as BusLocationRecord;
  } catch {
    return null;
  }
}

export async function fetchActiveBuses(): Promise<BusLocationRecord[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) return [];
    const data = (await res.json()) as { buses?: BusLocationRecord[] };
    return data.buses ?? [];
  } catch {
    return [];
  }
}
