import { createFileRoute } from "@tanstack/react-router";
import { Bus, Users, Route as RouteIcon, AlertTriangle, ArrowUpRight, TrendingUp, Clock, Plus } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { BusMap } from "@/components/BusMap";
import { buses, notifications, stats } from "@/lib/bus-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · GGI Transit" }, { name: "description", content: "Fleet command center for GGI Transit administrators." }] }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <DashboardShell
      title="Fleet Overview"
      subtitle="Live operations across GGI routes"
      actions={
        <button
          onClick={() => toast.success("New bus added to fleet")}
          className="hidden items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow sm:inline-flex"
        >
          <Plus className="h-4 w-4" /> Add bus
        </button>
      }
    >
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Bus} label="Total buses" value={stats.totalBuses} delta="+2 this week" color="brand" />
        <StatCard icon={TrendingUp} label="Active now" value={stats.active} delta="↑ 4 vs yesterday" color="success" />
        <StatCard icon={Users} label="Students on board" value={stats.studentsOnboard.toLocaleString()} delta="+8.2%" color="brand" />
        <StatCard icon={AlertTriangle} label="Open alerts" value={stats.alerts} delta="2 critical" color="danger" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-display text-base font-semibold">Live fleet map</div>
              <div className="text-xs text-muted-foreground">Realtime positions · refreshed every 1.5s</div>
            </div>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">● Live</span>
          </div>
          <BusMap className="h-[420px] w-full" />
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-display text-base font-semibold">Live activity</div>
            <button className="text-xs font-medium text-brand">View all</button>
          </div>
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 rounded-xl border bg-background p-3">
                <span className={cn(
                  "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                  n.type === "info" && "bg-brand",
                  n.type === "warning" && "bg-warning",
                  n.type === "success" && "bg-success",
                  n.type === "danger" && "bg-danger",
                )} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold">{n.title}</div>
                    <div className="shrink-0 text-[10px] text-muted-foreground">{n.time}</div>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <div className="font-display text-base font-semibold">Fleet status</div>
            <div className="text-xs text-muted-foreground">All buses currently operating</div>
          </div>
          <a className="inline-flex items-center gap-1 text-xs font-medium text-brand" href="#">Manage <ArrowUpRight className="h-3 w-3" /></a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Bus</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Driver</th>
                <th className="px-5 py-3">Next stop</th>
                <th className="px-5 py-3">Speed</th>
                <th className="px-5 py-3">Occupancy</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((b) => (
                <tr key={b.id} className="border-t hover:bg-muted/30">
                  <td className="px-5 py-3 font-semibold">{b.id}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.route}</td>
                  <td className="px-5 py-3">{b.driver}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.nextStop}</td>
                  <td className="px-5 py-3">{b.speed} km/h</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(b.occupancy / b.capacity) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{b.occupancy}/{b.capacity}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}

function StatCard({ icon: Icon, label, value, delta, color }: { icon: any; label: string; value: any; delta: string; color: "brand" | "success" | "danger" }) {
  const palette: Record<string, string> = {
    brand: "bg-brand-soft text-brand",
    success: "bg-success/15 text-success",
    danger: "bg-danger/15 text-danger",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-center justify-between">
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", palette[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-4 font-display text-3xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-[11px] font-medium text-success">{delta}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    active: "bg-success/15 text-success",
    idle: "bg-warning/15 text-warning",
    issue: "bg-danger/15 text-danger",
    offline: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", cls[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}