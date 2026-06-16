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

export const buses: Bus[] = [
  {
    id: "GGI-01",
    name: "Bus 1 - Express A1",
    route: "Golden Temple → Campus",
    driver: "Simran Kaur",
    status: "active",
    speed: 38,
    eta: "8 mins",
    occupancy: 18,
    capacity: 40,
    nextStop: "Hall Bazaar",
    lat: 31.6580,
    lng: 74.8800,
  },
  {
    id: "GGI-02",
    name: "Bus 2 - Shuttle B2",
    route: "Ranjit Avenue → Campus",
    driver: "Pooja Verma",
    status: "idle",
    speed: 0,
    eta: "12 mins",
    occupancy: 12,
    capacity: 35,
    nextStop: "Crystal Chowk",
    lat: 31.6690,
    lng: 74.8900,
  },
  {
    id: "GGI-03",
    name: "Bus 3 - Local C3",
    route: "Verka Bypass → Campus",
    driver: "Rajesh Kumar",
    status: "active",
    speed: 28,
    eta: "15 mins",
    occupancy: 25,
    capacity: 45,
    nextStop: "Verka Bypass",
    lat: 31.6790,
    lng: 74.9000,
  },
  {
    id: "GGI-04",
    name: "Bus 4 - Night D4",
    route: "GT Road → Campus",
    driver: "Amit Singh",
    status: "offline",
    speed: 0,
    eta: "—",
    occupancy: 0,
    capacity: 30,
    nextStop: "—",
    lat: 31.6340,
    lng: 74.8723,
  },
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