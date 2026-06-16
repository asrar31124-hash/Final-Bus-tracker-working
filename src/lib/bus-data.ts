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
  lat: 31.691001,
  lng: 74.971840,
  name: "11th Km Stone, Amritsar - Jammu Highway, NH 54, Amritsar, Punjab 143501",
};

export const buses: Bus[] = [];

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