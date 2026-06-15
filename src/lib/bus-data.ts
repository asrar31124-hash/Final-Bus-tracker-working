export type BusStatus = "active" | "idle" | "issue" | "offline";

export interface Bus {
  id: string;
  name: string;
  route: string;
  driver: string;
  status: BusStatus;
  speed: number;
  eta: string;
  occupancy: number;
  capacity: number;
  nextStop: string;
  /** Real geo coordinates (Amritsar area) */
  lat: number;
  lng: number;
}

/** Global Group of Institutes — Amritsar campus (approximate) */
export const CAMPUS: { lat: number; lng: number; name: string } = {
  lat: 31.5497,
  lng: 75.0185,
  name: "GGI Campus, Amritsar",
};

export const buses: Bus[] = [
  { id: "GGI-01", name: "Express A1", route: "Golden Temple → Campus", driver: "Rajeev Kumar", status: "active", speed: 42, eta: "4 min", occupancy: 38, capacity: 48, nextStop: "Hall Bazaar", lat: 31.6200, lng: 74.8765 },
  { id: "GGI-02", name: "Shuttle B2", route: "Ranjit Avenue → Campus", driver: "Simran Kaur", status: "active", speed: 38, eta: "9 min", occupancy: 41, capacity: 48, nextStop: "District Court", lat: 31.6537, lng: 74.8463 },
  { id: "GGI-03", name: "Loop C3", route: "Lawrence Road → Campus", driver: "Arjun Mehta", status: "active", speed: 31, eta: "12 min", occupancy: 22, capacity: 40, nextStop: "Crystal Chowk", lat: 31.6420, lng: 74.8620 },
  { id: "GGI-04", name: "Night D4", route: "Mall Road → Campus", driver: "Neha Sharma", status: "idle", speed: 0, eta: "Hold", occupancy: 0, capacity: 48, nextStop: "Depot", lat: 31.6100, lng: 74.8700 },
  { id: "GGI-05", name: "Express E5", route: "Batala Road → Campus", driver: "Vikram Singh", status: "issue", speed: 12, eta: "Delay 8m", occupancy: 30, capacity: 48, nextStop: "Verka Bypass", lat: 31.5810, lng: 74.9250 },
  { id: "GGI-06", name: "Shuttle F6", route: "Verka → Campus", driver: "Pooja Verma", status: "active", speed: 47, eta: "6 min", occupancy: 35, capacity: 48, nextStop: "GT Road", lat: 31.6650, lng: 74.8600 },
  { id: "GGI-07", name: "Loop G7", route: "Majitha Road → Campus", driver: "Manish Yadav", status: "offline", speed: 0, eta: "—", occupancy: 0, capacity: 40, nextStop: "Offline", lat: 31.6720, lng: 74.8520 },
];

export const routeStops = [
  { name: "Golden Temple Plaza", time: "07:15", status: "done" },
  { name: "Hall Bazaar", time: "07:24", status: "done" },
  { name: "Ranjit Avenue", time: "07:36", status: "current" },
  { name: "Crystal Chowk", time: "07:48", status: "next" },
  { name: "Verka Bypass", time: "07:58", status: "next" },
  { name: "GGI Campus, Amritsar", time: "08:10", status: "next" },
] as const;

export const notifications = [
  { id: 1, type: "info", title: "Bus GGI-02 arriving", body: "Express A1 reaches Gate 3 in 4 minutes.", time: "now" },
  { id: 2, type: "warning", title: "Route C3 delay", body: "Traffic on GT Road. ETA +6 min.", time: "2m" },
  { id: 3, type: "success", title: "Driver clocked in", body: "Pooja Verma started Shuttle F6.", time: "12m" },
  { id: 4, type: "danger", title: "Maintenance alert", body: "Bus GGI-05 reported low tire pressure.", time: "1h" },
];

export const stats = {
  totalBuses: 42,
  active: 31,
  studentsOnboard: 1284,
  routes: 18,
  onTime: 96.4,
  alerts: 3,
};