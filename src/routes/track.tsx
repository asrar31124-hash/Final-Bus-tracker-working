import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Search, Bus as BusIcon, Clock, Users, Gauge, Navigation } from "lucide-react";
import { BusMap } from "@/components/BusMap";
import { buses, routeStops } from "@/lib/bus-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Live Bus Tracking — GGI Transit" },
      { name: "description", content: "Live map of every GGI bus, with real-time ETAs and route details." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const [selected, setSelected] = useState(buses[0].id);
  const [query, setQuery] = useState("");
  const filtered = buses.filter(
    (b) => b.id.toLowerCase().includes(query.toLowerCase()) || b.route.toLowerCase().includes(query.toLowerCase()),
  );
  const active = buses.find((b) => b.id === selected) ?? buses[0];

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="glass z-10 flex h-14 items-center gap-3 border-b px-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
        </Link>
        <div className="hidden h-5 w-px bg-border sm:block" />
        <div className="font-display text-sm font-semibold sm:text-base">Live Bus Tracking</div>
        <div className="ml-auto flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bus or route…"
            className="w-44 bg-transparent outline-none placeholder:text-muted-foreground sm:w-64"
          />
        </div>
      </header>

      <div className="grid flex-1 overflow-hidden lg:grid-cols-[340px_1fr_320px]">
        {/* Bus list */}
        <aside className="hidden flex-col overflow-y-auto border-r bg-card/40 lg:flex">
          <div className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active fleet</div>
            <div className="mt-1 text-2xl font-display font-bold">{filtered.length} buses</div>
          </div>
          <div className="flex-1 space-y-2 px-3 pb-4">
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b.id)}
                className={cn(
                  "w-full rounded-xl border bg-card p-3 text-left shadow-soft transition hover:border-brand/50",
                  selected === b.id && "border-brand ring-2 ring-brand/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("grid h-9 w-9 place-items-center rounded-lg text-white",
                      b.status === "active" && "bg-success",
                      b.status === "idle" && "bg-warning",
                      b.status === "issue" && "bg-danger",
                      b.status === "offline" && "bg-muted-foreground",
                    )}>
                      <BusIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{b.id} · {b.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{b.route}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">ETA</div>
                    <div className="text-sm font-semibold">{b.eta}</div>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                No buses match your search.
              </div>
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="relative p-3 sm:p-4">
          <BusMap className="h-full w-full" selectedId={selected} onSelect={setSelected} />
        </div>

        {/* Detail panel */}
        <aside className="hidden flex-col overflow-y-auto border-l bg-card/40 p-4 lg:flex">
          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
                <BusIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg font-bold">{active.id}</div>
                <div className="truncate text-xs text-muted-foreground">{active.route}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat icon={Clock} label="ETA" value={active.eta} />
              <Stat icon={Gauge} label="Speed" value={`${active.speed} km/h`} />
              <Stat icon={Users} label="On board" value={`${active.occupancy}/${active.capacity}`} />
            </div>
            <div className="mt-4 rounded-xl bg-brand-soft/60 px-3 py-2 text-xs">
              <div className="text-muted-foreground">Driver</div>
              <div className="font-semibold text-foreground">{active.driver}</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="font-display text-sm font-semibold">Route timeline</div>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">On time</span>
            </div>
            <ol className="mt-4 space-y-3">
              {routeStops.map((s, i) => (
                <li key={s.name} className="relative flex items-start gap-3 pl-3">
                  <span className={cn(
                    "absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full",
                    s.status === "done" && "bg-muted-foreground/40",
                    s.status === "current" && "bg-brand ring-4 ring-brand/20",
                    s.status === "next" && "bg-card border-2 border-muted-foreground/40",
                  )} />
                  {i < routeStops.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-border" />}
                  <div className="flex-1">
                    <div className={cn("text-sm font-medium", s.status === "done" && "text-muted-foreground line-through")}>{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.time}</div>
                  </div>
                  {s.status === "current" && (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">Now</span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <button className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 text-sm font-semibold text-white shadow-glow">
            <Navigation className="h-4 w-4" /> Navigate to bus
          </button>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-2.5">
      <Icon className="mx-auto h-4 w-4 text-brand" />
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}