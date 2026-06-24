export type BusLocationRecord = {
  bus_id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  is_tracking: boolean;
  updated_at: string;
};

type Store = Map<string, BusLocationRecord>;

declare global {
  // eslint-disable-next-line no-var
  var __busLocationStore: Store | undefined;
}

function getStore(): Store {
  if (!globalThis.__busLocationStore) {
    globalThis.__busLocationStore = new Map();
  }
  return globalThis.__busLocationStore;
}

export function updateBusLocation(data: {
  bus_id: string;
  latitude: number;
  longitude: number;
  speed?: number | null;
  is_tracking?: boolean;
}): BusLocationRecord {
  const record: BusLocationRecord = {
    bus_id: data.bus_id,
    latitude: data.latitude,
    longitude: data.longitude,
    speed: data.speed ?? null,
    is_tracking: data.is_tracking !== false,
    updated_at: new Date().toISOString(),
  };
  getStore().set(data.bus_id, record);
  void syncToSupabase(record);
  return record;
}

export function getBusLocation(busId: string): BusLocationRecord | null {
  return getStore().get(busId) ?? null;
}

export function listTrackingBuses(): BusLocationRecord[] {
  return Array.from(getStore().values()).filter((b) => b.is_tracking);
}

export function stopBusTracking(busId: string): BusLocationRecord | null {
  const existing = getStore().get(busId);
  if (!existing) return null;
  const record: BusLocationRecord = {
    ...existing,
    is_tracking: false,
    updated_at: new Date().toISOString(),
  };
  getStore().set(busId, record);
  return record;
}

async function syncToSupabase(record: BusLocationRecord) {
  const url = process.env.VITE_SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/rest/v1/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        bus_id: record.bus_id,
        latitude: record.latitude,
        longitude: record.longitude,
        speed: record.speed,
        timestamp: record.updated_at,
      }),
    });
  } catch {
    // Supabase sync is optional
  }
}
